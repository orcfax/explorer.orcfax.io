import * as zlib from 'zlib';
import { promisify } from 'util';
import * as tar from 'tar-stream';
import { pipeline } from 'stream';
import { Readable } from 'stream';
import type { Archive, ArchivedFile, DirectoryNode, FactSourceMessage } from '$lib/types';
import { getFactByURN, getFeeds, getSources } from '$lib/server/db';
import {
	DBFactStatementSchema,
	type DBFactStatement,
	type DBFeedWithData,
	type Network
} from '$lib/types';
import { error, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ parent, params }) => {
	const { feed, network } = await parent();
	const factURN = `urn:orcfax:${params.fact_id}`;
	const selectedFact = await getSelectedFact(network, factURN, feed);

	return {
		feed,
		selectedFact,
		feeds: getFeeds(network),
		archive: getArchive(network, selectedFact)
	};
};

async function getArchive(network: Network, fact: DBFactStatement): Promise<Archive> {
	try {
		if (!fact.storage_urn)
			return {
				fact,
				directoryTree: null,
				files: null,
				sources: null
			};

		const archivedBagResponse = await fetch(
			`https://arweave.net/tx/${fact.storage_urn.slice(12)}/data.txt`,
			{
				headers: {
					'Content-Type': 'application/gzip'
				}
			}
		);

		if (!archivedBagResponse.body || !archivedBagResponse.ok)
			error(404, 'Unable to retrieve fact statement archival package');

		const contentType = archivedBagResponse.headers.get('content-type');
		if (!contentType || (!contentType.includes('x-tar') && !contentType.includes('gzip'))) {
			throw new Error(`Unexpected content type: ${contentType}`);
		}

		const archivedBagArrayBuffer = await archivedBagResponse.arrayBuffer();
		const archivedBagTarball = new Uint8Array(archivedBagArrayBuffer);

		const directoryTree = await buildFileExplorer(archivedBagTarball);
		const files = await getArchivedFilesFromTarball(archivedBagTarball);
		const sources = await getFactSourcesFromFileNames(network, files);

		return { fact, directoryTree, files, sources };
	} catch (e) {
		return error(404, 'No Fact Statement found with that ID');
	}
}

async function getFactSourcesFromFileNames(network: Network, files: ArchivedFile[]) {
	const allSources = await getSources(network);
	const fileNames = files.map((file) => file.fileName);

	// Assuming source message files in the archive will always contain the name of the source
	const sources = allSources.filter((source) =>
		fileNames.some((name) => name.includes(source.name))
	);

	return sources;
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
