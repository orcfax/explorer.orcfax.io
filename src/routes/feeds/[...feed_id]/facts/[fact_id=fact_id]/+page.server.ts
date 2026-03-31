import { error, type ServerLoad } from '@sveltejs/kit';
import { getArchive, getSelectedFact } from '$lib/server/db/archive';

export const load: ServerLoad = async ({ parent, params, locals }) => {
	try {
		const { feed, network } = await parent();
		const factURN = `urn:orcfax:${params.fact_id}`;
		const selectedFact = await getSelectedFact(locals.pb, network, factURN, feed);

		return {
			feed,
			selectedFact,
			// Lazy-load / stream the rest of the data
			archive: selectedFact ? getArchive(locals.pb, network, selectedFact, feed.source_type) : null
		};
	} catch (e) {
		return error(500, e as Error);
	}
};
