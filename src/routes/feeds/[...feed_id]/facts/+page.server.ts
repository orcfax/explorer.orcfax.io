import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ parent, params }) => {
	const layout = await parent();
	const latestFactID = layout.feed.latestFact.fact_urn.slice(11);
	throw redirect(307, `/feeds/${params.feed_id}/facts/${latestFactID}`);
};
