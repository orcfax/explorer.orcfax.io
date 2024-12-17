import type { PageServerLoad } from './$types';
import { getOrcfaxSummary } from '$lib/server/db';

export const load: PageServerLoad = async ({ parent }) => {
	const { network, networks } = await parent();

	const summary = await getOrcfaxSummary(network);

	return { summary, network, networks };
};
