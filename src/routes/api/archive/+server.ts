import JSZip from 'jszip';
import * as zlib from 'zlib';
import tar from 'tar-stream';
import { Readable } from 'stream';
import { type RequestHandler } from '@sveltejs/kit';
import archiveViewer from '$lib/archive-viewer.html?raw';
import { getArchiveFromURN } from '$lib/server/db/archive';
import { logError } from '$lib/server/logger';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const storageUrn = url.searchParams.get('storageUrn');
		const sourceType = url.searchParams.get('sourceType');
		const networkID = url.searchParams.get('networkID');

		if (!storageUrn || !sourceType || !networkID)
			return new Response(null, {
				status: 400,
				statusText: 'Missing parameters for archive download'
			});

		const archive = await getArchiveFromURN(networkID, storageUrn, sourceType);

		if (!archive) return new Response(null, { status: 404, statusText: 'Archive not found' });

		let indexHtml = archiveViewer;

		const archiveData = {
			fact: archive.fact,
			files: archive.files,
			details: archive.details,
			directoryTree: archive.directoryTree
		};
		indexHtml = injectJsonIntoHtml(indexHtml, archiveData);
		const extractedFiles = await extractGzFileFromStream(
			createReadableStreamFromUint8Array(archive.archiveZip)
		);

		// Create and send the zip archive
		const zipArchive = await createZipArchive(extractedFiles, indexHtml);
		return new Response(zipArchive, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="orcfax-archive-${archive.fact.feed_name}-${archive.fact.validation_date}.zip"`
			}
		});
	} catch (error) {
		logError(`Error fetching archive`, error);
		return new Response(null, { status: 500, statusText: 'Internal Server Error' });
	}
};

function injectJsonIntoHtml(htmlContent: string, jsonData: object) {
	return htmlContent.replace("'DATA_PLACEHOLDER'", JSON.stringify(jsonData, null, 2));
}

function createReadableStreamFromUint8Array(uint8Array: Uint8Array) {
	return new ReadableStream({
		start(controller) {
			controller.enqueue(uint8Array);
			controller.close();
		}
	});
}

async function extractGzFileFromStream(
	readableStream: ReadableStream<Uint8Array>
): Promise<Map<string, Buffer>> {
	const extractedFiles = new Map<string, Buffer>();
	const gunzip = zlib.createGunzip();
	const extract = tar.extract();

	return new Promise((resolve, reject) => {
		extract.on('entry', (header: { name: string }, stream: Readable, next: () => void) => {
			const chunks: Uint8Array[] = [];

			stream.on('data', (chunk: Buffer) => {
				chunks.push(Uint8Array.from(chunk));
			});

			stream.on('end', () => {
				extractedFiles.set(header.name, Buffer.concat(chunks));
				next();
			});

			stream.on('error', (error: Error) => reject(error));
		});

		extract.on('finish', () => resolve(extractedFiles));
		extract.on('error', (error: Error) => reject(error));

		bufferReadableStream(readableStream)
			.then((bufferedData) => {
				const nodeStream = convertBufferedDataToNodeStream(bufferedData);
				nodeStream.pipe(gunzip).pipe(extract);
			})
			.catch((error) => reject(error));
	});
}

async function bufferReadableStream(readableStream: ReadableStream<Uint8Array>): Promise<Buffer> {
	const reader = readableStream.getReader();
	const chunks: Uint8Array[] = [];

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		if (value) chunks.push(value);
	}

	const bufferChunks: Buffer[] = chunks.map((chunk) => Buffer.from(chunk));
	return Buffer.concat(bufferChunks as unknown as Uint8Array[]);
}

function convertBufferedDataToNodeStream(buffer: Buffer): Readable {
	return Readable.from(buffer);
}

async function createZipArchive(
	extractedFiles: Map<string, Buffer>,
	archiveHtmlFile: string
): Promise<Buffer> {
	const zip = new JSZip();

	for (const [filePath, fileContent] of extractedFiles) {
		zip.file(filePath, fileContent);
	}

	zip.file('archive-viewer.html', archiveHtmlFile);

	const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

	return zipContent;
}
