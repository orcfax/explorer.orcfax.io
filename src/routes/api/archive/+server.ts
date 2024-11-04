// src/routes/api/download/+server.js
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import * as zlib from 'zlib';
import tar from 'tar-stream';
import { Readable } from 'stream';
import { type RequestHandler } from '@sveltejs/kit';
import { getArchiveFromURN } from '$lib/server/db/archive';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const storageUrn = url.searchParams.get('storageUrn');
		const sourceType = url.searchParams.get('sourceType');

		if (!storageUrn || !sourceType)
			return new Response(null, {
				status: 400,
				statusText: 'Missing parameters for archive download'
			});

		const archive = await getArchiveFromURN(storageUrn, sourceType);

		if (!archive) return new Response(null, { status: 404, statusText: 'Archive not found' });

		const indexHtmlPath = path.join(process.cwd(), 'static', 'archive-viewer.html');
		let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

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
		console.error(error);
		return new Response('Internal Server Error', { status: 500 });
	}
};

function injectJsonIntoHtml(htmlContent: string, jsonData: object) {
	return htmlContent.replace("'DATA_PLACEHOLDER'", JSON.stringify(jsonData, null, 2));
}

function createReadableStreamFromUint8Array(uint8Array: Uint8Array) {
	return new ReadableStream({
		start(controller) {
			// Enqueue the Uint8Array into the stream
			controller.enqueue(uint8Array);
			// Close the stream once the data is pushed
			controller.close();
		}
	});
}

// Function to decompress and extract the .gz file from a ReadableStream
async function extractGzFileFromStream(
	readableStream: ReadableStream<Uint8Array>
): Promise<Map<string, Buffer>> {
	return new Promise(async (resolve, reject) => {
		const extractedFiles = new Map<string, Buffer>();
		const gunzip = zlib.createGunzip();
		const extract = tar.extract();

		extract.on('entry', (header: { name: string }, stream: Readable, next: () => void) => {
			const chunks: Buffer[] = [];

			stream.on('data', (chunk: Buffer) => {
				chunks.push(chunk);
			});

			stream.on('end', () => {
				extractedFiles.set(header.name, Buffer.concat(chunks));
				next(); // Continue to the next entry
			});

			stream.on('error', (error: Error) => reject(error));
		});

		extract.on('finish', () => resolve(extractedFiles));
		extract.on('error', (error: Error) => reject(error));

		try {
			// Buffer the ReadableStream and convert it to a Node.js Readable stream
			const bufferedData = await bufferReadableStream(readableStream);
			const nodeStream = convertBufferedDataToNodeStream(bufferedData);

			// Pipe the Node.js stream into gunzip and then into the tar extractor
			nodeStream.pipe(gunzip).pipe(extract);
		} catch (error) {
			reject(error);
		}
	});
}

async function bufferReadableStream(readableStream: ReadableStream<Uint8Array>): Promise<Buffer> {
	const reader = readableStream.getReader();
	const chunks: Uint8Array[] = [];

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		if (value) chunks.push(value);
	}

	// Concatenate all chunks into a single Buffer
	return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

function convertBufferedDataToNodeStream(buffer: Buffer): Readable {
	return Readable.from(buffer);
}

// Function to create a zip archive with the extracted files and archive.html
async function createZipArchive(
	extractedFiles: Map<string, Buffer>,
	archiveHtmlFile: string
): Promise<Buffer> {
	const zip = new JSZip();

	// Add the extracted files to the zip archive
	for (const [filePath, fileContent] of extractedFiles) {
		zip.file(filePath, fileContent);
	}

	// Add the archive-viewer.html file to the zip archive
	zip.file('archive-viewer.html', archiveHtmlFile);

	// Generate the zip file and write it to the output path
	const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

	return zipContent;
}
