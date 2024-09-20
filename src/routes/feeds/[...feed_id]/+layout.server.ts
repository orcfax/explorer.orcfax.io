import { error } from '@sveltejs/kit';
import { getFeedByID, getFeedFactsByDateRange, getFeeds } from '$lib/server/db';
import { getFeedChartRange } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent, params, url }) => {
	const { network } = await parent();
	const feed = await getFeedByID(network, params.feed_id);
	if (!feed) error(404, 'Feed not found');
	const range = getFeedChartRange(url.searchParams.get('range'));
	const chartFacts = await getFeedFactsByDateRange(
		network,
		feed.id,
		parseInt(range),
		new Date(feed.latestFact.validation_date)
		// test
	);

	return {
		feed,
		chartFacts,
		network,
		feeds: getFeeds(network)
	};
};
