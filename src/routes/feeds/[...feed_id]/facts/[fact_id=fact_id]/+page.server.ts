import { env } from '$env/dynamic/private';
import { error, type ServerLoad } from '@sveltejs/kit';
import { getArchive, getSelectedFact } from '$lib/server/db/archive';
import {
	XerberusRiskRatingAPIResponseSchema,
	type Asset,
	type XerberusRiskRating
} from '$lib/types';
import { logError } from '$lib/server/logger';

export const load: ServerLoad = async ({ parent, params }) => {
	try {
		const { feed, network } = await parent();
		const factURN = `urn:orcfax:${params.fact_id}`;
		const selectedFact = await getSelectedFact(network, factURN, feed);

		return {
			feed,
			selectedFact,
			// Lazy-load / stream the rest of the data
			archive: selectedFact ? getArchive(network, selectedFact, feed.source_type) : null,
			riskRatings: {
				base: feed.base_asset?.fingerprint ? getXerberusRiskRating(feed.base_asset) : null,
				quote: feed.quote_asset?.fingerprint ? getXerberusRiskRating(feed.quote_asset) : null
			}
		};
	} catch (e) {
		return error(500, e as Error);
	}
};

async function getXerberusRiskRating(asset: Asset): Promise<XerberusRiskRating | null> {
	try {
		const apiKey = env.PRIVATE_XERBERUS_API_KEY;
		const userEmail = env.PRIVATE_XERBERUS_USER_EMAIL;
		if (!apiKey || !userEmail) throw new Error('Missing Xerberus API key');

		// Ignore assets that don't have a fingerprint or are unsupported by Xerberus
		if (!asset.fingerprint || !asset.hasXerberusRiskRating) return null;

		const endpoint = `https://api.xerberus.io/public/v1/risk/score/asset?fingerprint=${asset.fingerprint}`;
		const res = await fetch(endpoint, {
			headers: {
				'x-api-key': apiKey,
				'x-user-email': userEmail
			}
		});
		if (!res.ok) {
			throw new Error(`Bad response from Xerberus API`);
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
	} catch (e) {
		logError(`Failed to fetch data from Xerberus Risk API for ${asset.ticker}`, e);
		return null;
	}
}
