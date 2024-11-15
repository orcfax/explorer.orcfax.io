import type { PageServerLoad } from './$types';
import { getOrcfaxSummary, getSources } from '$lib/server/db';

export const load: PageServerLoad = async ({ parent }) => {
	const { network, networks } = await parent();

	const summary = await getOrcfaxSummary(network);

	return { summary, network, networks, sources: getSources() };
};
