import type { PageServerLoad } from './$types';
import { getFeeds, getOrcfaxSummary, getSources } from '$lib/server/db';

export const load: PageServerLoad = async ({ parent }) => {
	const { network, networks } = await parent();
	const feeds = await getFeeds(network);
	const summary = await getOrcfaxSummary(network);

	return { summary, feeds, network, networks, sources: getSources(network) };
};
