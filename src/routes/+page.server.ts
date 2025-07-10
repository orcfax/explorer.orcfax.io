export const ssr = false;

import type { PageServerLoad } from './$types';
import { getAllNodes, getAllSources, getNetworkSummary } from '$lib/server/db';

export const load: PageServerLoad = async ({ parent }) => {
	const { network, networks } = await parent();

	return {
		network,
		networks,
		// Lazy load / stream dashboard, nodes, and sources
		dashboard: getNetworkSummary(network.id),
		nodes: getAllNodes(network),
		sources: getAllSources(network.id)
	};
};
