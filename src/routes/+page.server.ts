export const ssr = false;

import {
	getAllSources,
	getActiveFeedsCount,
	getAllFactsCount,
	getAllNodes,
	getTodaysFactsCount
} from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { network, networks } = await parent();

	return {
		totalFacts: getAllFactsCount(network),
		totalFacts24Hour: getTodaysFactsCount(network),
		totalActiveFeeds: getActiveFeedsCount(network),
		nodes: getAllNodes(network),
		sources: getAllSources(network.id),
		network,
		networks
	};
};
