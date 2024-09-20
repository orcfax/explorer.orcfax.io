import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params }) => {
	throw redirect(307, `/feeds/${params.feed_id}/facts`);
};
