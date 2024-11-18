import { env } from '$env/dynamic/private';
import { error, type ServerLoad } from '@sveltejs/kit';
import { getArchive, getSelectedFact } from '$lib/server/db/archive';
import {
	XerberusRiskRatingAPIResponseSchema,
	type Asset,
	type XerberusRiskRating
} from '$lib/types';

export const load: ServerLoad = async ({ parent, params }) => {
	try {
		const { feed, network } = await parent();
		const factURN = `urn:orcfax:${params.fact_id}`;
		const selectedFact = await getSelectedFact(network, factURN, feed);

		return {
			feed,
			selectedFact,
			// Lazy-load / stream the rest of the data
			archive: selectedFact ? getArchive(selectedFact, feed.source_type) : null,
			riskRatings: {
				base: feed.base_asset?.fingerprint ? getXerberusRiskRating(feed.base_asset) : null,
				quote: feed.quote_asset?.fingerprint ? getXerberusRiskRating(feed.quote_asset) : null
			}
		};
	} catch (e) {
		console.error(JSON.stringify(e, null, 2));
		return error(500, 'An error occurred');
	}
};

async function getXerberusRiskRating(asset: Asset): Promise<XerberusRiskRating | null> {
	const apiKey = env.PRIVATE_XERBERUS_API_KEY;
	const userEmail = env.PRIVATE_XERBERUS_USER_EMAIL;
	if (!apiKey || !userEmail) error(500, 'Missing Xerberus API key');

	// Asset fingerprint is required to fetch data from Xerberus API
	if (!asset.fingerprint) return null;

	const endpoint = `https://api.xerberus.io/public/v1/risk/score/asset?fingerprint=${asset.fingerprint}`;
	const res = await fetch(endpoint, {
		headers: {
			'x-api-key': apiKey,
			'x-user-email': userEmail
		}
	});
	if (!res.ok) error(500, 'Failed to fetch data from Xerberus API');
	const xSignedBy = res.headers.get('X-SIGNED-BY');
	const xSignature = res.headers.get('X-SIGNATURE');
	if (!xSignedBy || !xSignature) error(500, 'Missing Xerberus API signature headers');
	const data = await res.json();
	const parsed = XerberusRiskRatingAPIResponseSchema.safeParse(data);
	if (!parsed.success) {
		console.error(
			`Failed to parse Xerberus API response for ${asset.ticker}:`,
			JSON.stringify(parsed.error, null, 2)
		);
		return null;
	}
	const response = parsed.data;

	return {
		response,
		xSignedBy,
		xSignature,
		endpoint: endpoint
	};
}
