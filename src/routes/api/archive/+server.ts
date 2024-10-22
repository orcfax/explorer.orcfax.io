// src/routes/api/download/+server.js
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import tar from 'tar-stream';
import { pipeline } from 'stream';
import { createGunzip } from 'zlib';
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

		const zip = new JSZip();
		const archive = await getArchiveFromURN(storageUrn, sourceType);

		if (!response.ok || response.body === null) {
			throw new Error(`Failed to download file: ${response.statusText}`);
		}

		const extractFolderName = await extractTarGz(response.body, zip);

		const indexHtmlPath = path.join(process.cwd(), 'build', 'archive.html');
		let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

		const jsonData = {
			/* JSON Archive Data from req body */
		};
		indexHtml = injectJsonIntoHtml(indexHtml, jsonData);
		zip.file('archive.html', indexHtml);

		// Step 4: Generate the zip file
		const content = await zip.generateAsync({ type: 'nodebuffer' });

		// Step 5: Send the zip file as a response
		return new Response(content, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': 'attachment; filename="archive.zip"'
			}
		});
	} catch (error) {
		console.error(error);
		return new Response('Internal Server Error', { status: 500 });
	}
};

function injectJsonIntoHtml(htmlContent: string, jsonData: object) {
	return htmlContent.replace('INJECT_JSON_HERE', JSON.stringify(jsonData));
}

async function extractTarGz(gzStream: ReadableStream<Uint8Array>, zip: JSZip) {
	return new Promise((resolve, reject) => {
		const gunzip = createGunzip();
		const extract = tar.extract();
		let rootFolderName: string | null = null;

		extract.on('entry', async (header, stream, next) => {
			const filePath = header.name;

			// Capture the root folder name
			if (!rootFolderName) {
				const parts = filePath.split('/');
				rootFolderName = parts[0];
			}

			// Read the file content
			const chunks = [];
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('end', () => {
				const fileContent = Buffer.concat(chunks);

				if (header.type === 'file') {
					// Add the file to the zip archive, preserving the folder structure
					zip.file(filePath, fileContent);
				}

				next();
			});
			stream.on('error', (err) => {
				console.error('Stream error:', err);
				reject(err);
			});
		});

		extract.on('finish', () => {
			resolve(rootFolderName);
		});

		extract.on('error', (err) => {
			console.error('Extract error:', err);
			reject(err);
		});

		// Pipe the gzipped stream through gunzip and then to tar extract
		pipeline(gzStream, gunzip, extract, (err) => {
			if (err) {
				console.error('Pipeline error:', err);
				reject(err);
			}
		});
	});
}
