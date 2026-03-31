import { error } from '@sveltejs/kit';
import { getFeedByID, getFeedFactsByDateRange, getFeeds } from '$lib/server/db';
import { getFeedChartRange } from '$lib/types';
import { getXerberusRiskRating } from '$lib/server/xerberus';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent, params, url, locals, depends }) => {
	depends('app:live-data');
	const { network } = await parent();
	const feedID = params.feed_id.replace(/\/facts\/undefined$/, '');
	const feed = await getFeedByID(locals.pb, network, feedID);
	if (!feed) error(404, 'Feed not found');
	const range = getFeedChartRange(url.searchParams.get('range'));
	const chartFacts = feed.latestFact
		? await getFeedFactsByDateRange(
				locals.pb,
				network,
				feed.feed_id,
				parseInt(range),
				new Date(feed.latestFact.validation_date)
			)
		: [];

	return {
		feed,
		chartFacts,
		network,
		feeds: getFeeds(locals.pb, network),
		riskRatings: {
			base: feed.base_asset?.fingerprint ? getXerberusRiskRating(feed.base_asset) : null,
			quote: feed.quote_asset?.fingerprint ? getXerberusRiskRating(feed.quote_asset) : null
		}
	};
};
