import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params }) => {
	const feedID = params.feed_id?.replace(/\/facts\/undefined$/, '');
	throw redirect(307, `/feeds/${feedID}/facts`);
};
