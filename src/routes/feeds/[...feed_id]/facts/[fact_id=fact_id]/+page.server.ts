import { error, type ServerLoad } from '@sveltejs/kit';
import { getArchive, getSelectedFact } from '$lib/server/db/archive';

export const load: ServerLoad = async ({ parent, params }) => {
	try {
		const { feed, network } = await parent();
		const factURN = `urn:orcfax:${params.fact_id}`;
		const selectedFact = await getSelectedFact(network, factURN, feed);

		return {
			feed,
			selectedFact,
			// Lazy-load / stream the rest of the data
			archive: selectedFact ? getArchive(selectedFact, feed.source_type) : null
		};
	} catch (e) {
		console.error(JSON.stringify(e, null, 2));
		return error(500, 'An error occurred');
	}
};
