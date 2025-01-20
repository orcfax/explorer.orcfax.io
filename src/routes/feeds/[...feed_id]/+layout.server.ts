import { error } from '@sveltejs/kit';
import { getFeedByID, getFeedFactsByDateRange } from '$lib/server/db';
import { getFeedChartRange } from '$lib/client/helpers';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent, params, url }) => {
	const { network } = await parent();
	const feedID = params.feed_id.replace(/\/facts\/undefined$/, '');
	const feed = await getFeedByID(network, feedID);
	if (!feed) error(404, 'Feed not found');
	const range = getFeedChartRange(url.searchParams.get('range'));
	const chartFacts = feed.latestFact
		? await getFeedFactsByDateRange(
				network,
				feed.id,
				parseInt(range),
				new Date(feed.latestFact.validation_date)
			)
		: [];

	return {
		feed,
		chartFacts,
		network
	};
};
