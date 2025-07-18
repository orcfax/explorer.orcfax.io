import type { PageServerLoad } from './$types';
import { getAllNodes, getAllSources, getNetworkSummary } from '$lib/server/db';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { network, networks } = await parent();

	return {
		network,
		networks,
		// Lazy load / stream dashboard, nodes, and sources
		dashboard: getNetworkSummary(locals.pb, network.id),
		nodes: getAllNodes(locals.pb, network),
		sources: getAllSources(locals.pb, network.id)
	};
};
