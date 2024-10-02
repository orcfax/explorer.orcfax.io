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
	FactSourceMessage
} from '$lib/types';
import { getFactByURN, getFeeds, getSources } from '$lib/server/db';
import {
	CEXValidationFileSchema,
	DBFactStatementSchema,
	DEXValidationFileSchema,
	SourceSchema,
	type DBFactStatement,
	type DBFeedWithData,
	type Network
} from '$lib/types';
import { error, type ServerLoad } from '@sveltejs/kit';
import { z } from 'zod';

export const load: ServerLoad = async ({ parent, params }) => {
	try {
		const { feed, network } = await parent();
		const factURN = `urn:orcfax:${params.fact_id}`;
		const selectedFact = await getSelectedFact(network, factURN, feed);

		return {
			feed,
			selectedFact,
			// Lazy-load / stream the rest of the data
			feeds: getFeeds(network),
			archive: getArchive(network, selectedFact, feed.source_type)
		};
	} catch (e) {
		console.error(JSON.stringify(e, null, 2));
		return error(500, 'An error occurred');
	}
};

async function getArchive(
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
			error(404, 'Unable to retrieve fact statement archival package');
		}

		const contentType = archivedBagResponse.headers.get('content-type');
		if (!contentType || (!contentType.includes('x-tar') && !contentType.includes('gzip'))) {
			throw new Error(`Unexpected content type: ${contentType}`);
		}

		const archivedBagArrayBuffer = await archivedBagResponse.arrayBuffer();
		const archivedBagTarball = new Uint8Array(archivedBagArrayBuffer);

		const directoryTree = await buildFileExplorer(archivedBagTarball);
		const files = await getArchivedFilesFromTarball(archivedBagTarball);
		const details = await getDetailsFromArchive(network, files, sourceType);

		return { fact, directoryTree, files, details };
	} catch (e) {
		console.error('Something went wrong fetching the archive: ', JSON.stringify(e, null, 2));
		return {
			fact,
			directoryTree: null,
			files: null,
			details: null
		};
	}
}

async function getDetailsFromArchive(
	network: Network,
	files: ArchivedFile[],
	sourceType: DBFeed['source_type']
): Promise<ArchiveDetails | null> {
	try {
		// Get message file names for source matching
		const allSources = await getSources(network);
		const allFileNames = files.map((file) => file.fileName);
		const messageFileNames = allFileNames
			.filter((name) => name.includes('message-'))
			.map((name) => name.toLowerCase());

		// Map file names to sources with exact name matching
		let sources = messageFileNames.map((name) => {
			const words = name.split(/[^a-zA-Z0-9]+/);
			const source = allSources.find((source) => {
				return words.includes(source.name.toLowerCase());
			});
			// TODO: This isn't being caught properly
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
	} catch (e) {
		console.error('error', JSON.stringify(e, null, 2));
		return null;
	}
}

async function getSelectedFact(
	network: Network,
	factURN: string,
	feed: DBFeedWithData
): Promise<DBFactStatement> {
	let selectedFact = feed.latestFact;
	if (factURN !== feed.latestFact.fact_urn) {
		const response = await getFactByURN(network, factURN);
		const parsed = DBFactStatementSchema.safeParse(response).data || feed.latestFact;
		selectedFact = parsed;
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
		gunzip.on('error', (error) => {
			console.error('Error during decompression:', error);
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

	try {
		const gunzip = zlib.createGunzip();
		gunzip.on('error', (error) => {
			console.error('Error during decompression:', error);
		});
		await pipelineAsync(stream, gunzip, extract);
	} catch (err) {
		console.error('Pipeline failed', err);
		throw err;
	}

	return files;
}
