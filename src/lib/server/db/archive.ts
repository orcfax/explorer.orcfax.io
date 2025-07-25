import * as zlib from 'zlib';
import { promisify } from 'util';
import * as tar from 'tar-stream';
import { pipeline } from 'stream';
import { Readable } from 'stream';
import type {
	Archive,
	ArchiveDetails,
	ArchivedFile,
	CEXValidationFile,
	DEXValidationFile,
	DBFeed,
	DirectoryNode,
	FactSourceMessage,
	ArchiveDownload,
	FactStatementStub,
	DBFactStatementWithFeed
} from '$lib/types';
import { getFactByURN, getAllSources } from '$lib/server/db';
import {
	BagInfoSchema,
	CEXValidationFileSchema,
	DEXValidationFileSchema,
	SourceSchema,
	type DBFactStatement,
	type DBFeedWithData,
	type Network
} from '$lib/types';
import { z } from 'zod';
import { logError } from '$lib/server/logger';
import type PocketBase from 'pocketbase';

export async function getArchive(
	db: PocketBase,
	network: Network,
	fact: DBFactStatement,
	sourceType: DBFeed['source_type']
): Promise<Archive> {
	try {
		if (!fact.storage_urn)
			return {
				fact,
				directoryTree: null,
				files: null,
				details: null
			};

		const archivedBagResponse = await fetch(
			`https://arweave.net/${fact.storage_urn.slice(12)}`,
			{}
		);

		if (!archivedBagResponse.body || !archivedBagResponse.ok) {
			throw new Error(`Bad response from Arweave`);
		}

		const contentType = archivedBagResponse.headers.get('content-type');
		if (!contentType || (!contentType.includes('x-tar') && !contentType.includes('gzip'))) {
			throw new Error(`Unexpected content type: ${contentType} for ${fact.fact_urn}`);
		}

		const archivedBagArrayBuffer = await archivedBagResponse.arrayBuffer();
		const archivedBagTarball = new Uint8Array(archivedBagArrayBuffer);

		const directoryTree = await buildFileExplorer(archivedBagTarball.buffer);
		const files = await getArchivedFilesFromTarball(archivedBagTarball.buffer);
		const details = await getDetailsFromArchive(db, network.id, files, sourceType);

		return { fact, directoryTree, files, details };
	} catch (e) {
		await logError(`Something went wrong fetching the archive for ${fact.fact_urn}`, e);
		return {
			fact,
			directoryTree: null,
			files: null,
			details: null
		};
	}
}

export async function getArchiveFromURN(
	db: PocketBase,
	networkID: string,
	storage_urn: string,
	sourceType: string
): Promise<ArchiveDownload | null> {
	try {
		const archivedBagResponse = await fetch(`https://arweave.net/${storage_urn.slice(12)}`, {});

		if (!archivedBagResponse.body || !archivedBagResponse.ok) {
			throw new Error(`Bad response from Arweave`);
		}

		const contentType = archivedBagResponse.headers.get('content-type');
		if (!contentType || (!contentType.includes('x-tar') && !contentType.includes('gzip'))) {
			throw new Error(`Unexpected content type: ${contentType}`);
		}

		const archivedBagArrayBuffer = await archivedBagResponse.arrayBuffer();
		const archivedBagTarball = new Uint8Array(archivedBagArrayBuffer);

		const directoryTree = await buildFileExplorer(archivedBagTarball.buffer);
		const files = await getArchivedFilesFromTarball(archivedBagTarball.buffer);
		const details = await getDetailsFromArchive(db, networkID, files, sourceType);
		const fact = getFactStatementFromArchive(files);

		return { fact, directoryTree, files, details, archiveZip: archivedBagTarball };
	} catch (e) {
		await logError(`Something went wrong fetching the archive for ${storage_urn}`, e);
		return null;
	}
}

function getFactStatementFromArchive(files: ArchivedFile[]): FactStatementStub {
	const bagInfoFile = files.find((file) => file.fileName.includes('bag-info.txt'));
	if (!bagInfoFile || typeof bagInfoFile.content !== 'string')
		throw new Error('Bag info file not found in archive');
	const bagInfo = parseBagInfoTextFile(bagInfoFile.content);
	return {
		fact_urn: bagInfo['Fact-Datum-URN'],
		feed_name: bagInfo['Feed-Name'],
		feed_type: bagInfo['Feed-Type'],
		value: bagInfo['Fact-Datum-Value'],
		inverse_value: 0,
		description: bagInfo['Fact-Description'],
		inverse_description: '',
		validation_date: bagInfo['Fact-Validation-Date']
	};
}

async function getDetailsFromArchive(
	db: PocketBase,
	networkID: string,
	files: ArchivedFile[],
	sourceType: string
): Promise<ArchiveDetails | null> {
	// Get message file names for source matching
	const allSources = await getAllSources(db, networkID);
	const allFileNames = files.map((file) => file.fileName);
	const messageFileNames = allFileNames
		.filter((name) => name.includes('message-'))
		.map((name) => name.toLowerCase());

	// Map file names to sources with exact name matching
	let sources = messageFileNames.map((name) => {
		const match = name.match(/-([\w.]+?)(?:\.tick_|-\d{4}-\d{2}-\d{2}T)/i);
		if (!match) throw new Error('Error retrieving source name from file name');
		const source = allSources.find((source) => {
			return match[1].toLowerCase() === source.name.toLowerCase();
		});
		if (!source) throw new Error(`Source not found in db: ${name}`);
		return source;
	});

	// Get validation file
	let validationFileContents: CEXValidationFile | DEXValidationFile;
	const validationFile = files.find((file) => file.fileName.includes('validation-'));
	if (!validationFile) throw new Error('Validation file not found in archive');

	// Parse validation file contents
	if (sourceType === 'CEX') {
		validationFileContents = CEXValidationFileSchema.parse(validationFile.content);
		const collectedDataPoints =
			validationFileContents.additionalType[1].about.variableMeasured.valueReference || [];
		sources = sources.map((source, i) => ({
			...source,
			assetPairValue: collectedDataPoints[i]
		}));
	} else if (sourceType === 'DEX') {
		validationFileContents = DEXValidationFileSchema.parse(validationFile.content);
		const collectedBaseDataPoints =
			validationFileContents.additionalType[1].about.valueReference[0] || [];
		const collectedQuoteDataPoints =
			validationFileContents.additionalType[1].about.valueReference[1] || [];
		sources = sources.map((source, i) => ({
			...source,
			baseAssetValue: collectedBaseDataPoints[i],
			quoteAssetValue: collectedQuoteDataPoints[i]
		}));
	} else {
		throw new Error('Unknown source type');
	}
	const collectionTimestamp = validationFileContents.additionalType[0].recordedIn.hasPart[0].text;
	const collectorNodeID = validationFileContents.isBasedOn.identifier;
	const contentSignature = validationFileContents.additionalType[0].recordedIn.description.sha256;
	const calculationMethod = validationFileContents.additionalType[1].description;
	const validationDate = validationFileContents.additionalType[0].startDate;

	return {
		sources: z.array(SourceSchema).parse(sources),
		collectionTimestamp,
		collectorNodeID,
		contentSignature,
		calculationMethod,
		validationDate,
		sourceType
	};
}

export async function getSelectedFact(
	db: PocketBase,
	network: Network,
	factURN: string,
	feed: DBFeedWithData
): Promise<DBFactStatementWithFeed | null> {
	if (feed.latestFact === null) return null;

	let selectedFact: DBFactStatementWithFeed = { ...feed.latestFact, feed };
	if (factURN !== feed.latestFact.fact_urn) {
		const fact = await getFactByURN(db, network, factURN, `feed="${feed.id}"`);
		if (!fact) return null;
		selectedFact = fact;
	}

	return selectedFact;
}

async function buildFileExplorer(tarball: ArrayBuffer): Promise<DirectoryNode[]> {
	const directory = await getDirectoryTree(tarball);

	const root: DirectoryNode = {
		type: 'folder',
		name: '',
		nodes: []
	};

	// Helper function to get the parent folder for a given path
	function getParentFolder(path: string, parent: DirectoryNode): DirectoryNode {
		const segments = path.split('/').filter((segment) => segment !== '');
		let currentFolder = parent;
		for (let i = 0; i < segments.length - 1; i++) {
			const segment = segments[i];
			let nextFolder = currentFolder.nodes?.find((child) => child.name === segment);
			if (!nextFolder) {
				nextFolder = { type: 'folder', name: segment, nodes: [] };
				currentFolder.nodes?.push(nextFolder);
			}
			currentFolder = nextFolder;
		}
		return currentFolder;
	}

	// Iterate through each item in the input array and build the file explorer object
	directory.forEach((item) => {
		const path = item;
		const segments = path.split('/').filter((segment: string) => segment !== '');
		const filename = segments[segments.length - 1];
		const parentFolder = getParentFolder(path, root);

		if (path.endsWith('/')) {
			// It's a folder
			parentFolder.nodes?.push({ type: 'folder', name: filename, nodes: [] });
		} else {
			// It's a file
			parentFolder.nodes?.push({
				type: 'file',
				name: filename
			});
		}
	});

	return root.nodes || [];
}

async function getDirectoryTree(tarball: ArrayBuffer): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const extract = tar.extract();
		const fileAndDirectoryNames: string[] = [];

		extract.on('entry', (header, stream, next) => {
			// Each header object represents a file or directory
			// and has fields such as name, type, size, etc
			fileAndDirectoryNames.push(header.name);

			// Important: call next when you're done with this entry
			stream.on('end', function () {
				next();
			});

			// Since we're not interested in the file data, resume immediately
			stream.resume();
		});

		extract.on('finish', () => {
			resolve(fileAndDirectoryNames);
		});

		extract.on('error', (error) => {
			reject(error);
		});

		// Use zlib to decompress the gzipped tarball and pipe it into the tar extract stream
		const gunzip = zlib.createGunzip();
		gunzip.on('error', async (error) => {
			throw error;
		});
		const buffer = Buffer.from(tarball);
		const bufferStream = Readable.from(buffer);
		bufferStream.pipe(gunzip).pipe(extract);
	});
}

const pipelineAsync = promisify(pipeline);

async function getArchivedFilesFromTarball(tarball: ArrayBuffer): Promise<ArchivedFile[]> {
	const tarballBuffer = Buffer.from(tarball);
	const stream = Readable.from(tarballBuffer);
	const extract = tar.extract();
	const files: ArchivedFile[] = [];

	extract.on('entry', (header, stream, next) => {
		let content = '';
		stream.on('data', (chunk) => (content += chunk.toString()));
		stream.on('end', () => {
			if (header.name.endsWith('.txt') || header.name.endsWith('.json')) {
				const fileExtension = header.name.split('.').pop() ?? 'Unknown';
				const segments = header.name.split('/').filter((segment: string) => segment !== '');
				const fileName = segments[segments.length - 1];

				let fileContent = header.name.endsWith('.json') ? JSON.parse(content) : content;

				// If the file is a fact source message, parse the message attachment text as JSON
				if (typeof fileContent === 'object' && fileName.startsWith('message-')) {
					const message: FactSourceMessage = fileContent;
					if (message.messageAttachment.encoding === 'application/json;base64') {
						message.messageAttachment.text = JSON.parse(
							Buffer.from(message.messageAttachment.text as string, 'base64').toString('ascii')
						);

						if (
							typeof message.messageAttachment.text === 'object' &&
							typeof message.messageAttachment.text.response === 'string'
						)
							message.messageAttachment.text.response = JSON.parse(
								Buffer.from(message.messageAttachment.text.response as string, 'base64').toString(
									'ascii'
								)
							);

						fileContent = message;
					}
				}

				files.push({
					name: header.name,
					fileName,
					extension: fileExtension.toUpperCase(),
					content: fileContent
				});
			}
			next();
		});
		stream.resume();
	});

	const gunzip = zlib.createGunzip();
	gunzip.on('error', async (error) => {
		throw error;
	});
	await pipelineAsync(stream, gunzip, extract);

	return files;
}

function parseBagInfoTextFile(text: string) {
	// Convert text file contents into an object
	const data: Record<string, string> = text.split('\n').reduce(
		(acc, line) => {
			const [key, ...valueParts] = line.split(': ');
			if (key && valueParts.length > 0) {
				acc[key] = valueParts.join(': ').trim();
			}
			return acc;
		},
		{} as Record<string, string>
	);

	// Validate and parse the data
	const result = BagInfoSchema.safeParse(data);

	if (!result.success) {
		throw new Error(`Validation errors: ${result.error.format()}`);
	}

	return result.data;
}
