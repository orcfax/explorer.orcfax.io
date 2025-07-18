import { logError } from './logger';
import { env } from '$env/dynamic/private';
import {
	type Asset,
	type XerberusRiskRating,
	XerberusRiskRatingAPIResponseSchema
} from '$lib/types';

export async function getXerberusRiskRating(asset: Asset): Promise<XerberusRiskRating | null> {
	try {
		const apiKey = env.PRIVATE_XERBERUS_API_KEY;
		const userEmail = env.PRIVATE_XERBERUS_USER_EMAIL;
		if (!apiKey || !userEmail) throw new Error('Missing Xerberus API key');

		// Ignore assets that don't have a fingerprint or are unsupported by Xerberus
		if (!asset.fingerprint || !asset.hasXerberusRiskRating) return null;

		let lastError: Error | null = null;
		for (let attempt = 1; attempt <= 2; attempt++) {
			try {
				return await makeXerberusRequest(asset, apiKey, userEmail);
			} catch (e) {
				lastError = e as Error;
				if (attempt < 2) {
					// Only wait before the second attempt
					await new Promise((resolve) => setTimeout(resolve, 1000));
					continue;
				}
			}
		}

		// If we get here, all retries failed
		throw lastError;
	} catch (e) {
		logError(`Failed to fetch data from Xerberus Risk API for ${asset.ticker}`, e);
		return null;
	}
}

async function makeXerberusRequest(
	asset: Asset,
	apiKey: string,
	userEmail: string
): Promise<XerberusRiskRating> {
	const endpoint = `https://api.xerberus.io/public/v1/risk/score/asset?fingerprint=${asset.fingerprint}`;
	const res = await fetch(endpoint, {
		headers: {
			'x-api-key': apiKey,
			'x-user-email': userEmail
		}
	});
	if (!res.ok) {
		throw new Error(`Bad response from Xerberus API: ${res.status}`);
	}

	const xSignedBy = res.headers.get('X-SIGNED-BY');
	const xSignature = res.headers.get('X-SIGNATURE');
	if (!xSignedBy || !xSignature) throw new Error(`Missing Xerberus API signature headers`);

	const data = await res.json();
	const response = XerberusRiskRatingAPIResponseSchema.parse(data);

	return {
		response,
		xSignedBy,
		xSignature,
		endpoint: endpoint
	};
}
