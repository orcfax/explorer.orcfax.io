import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ parent, params }) => {
	const layout = await parent();
	const latestFactID = layout.feed.latestFact
		? layout.feed.latestFact.fact_urn.slice(11)
		: undefined;
	const feedID = params.feed_id?.replace(/\/facts\/undefined$/, '');
	throw redirect(307, `/feeds/${feedID}/facts/${latestFactID}`);
};
