import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFactsPage } from '$lib/server/db/index.js';

export const GET: RequestHandler = async ({ url, locals }) => {
	const pageParam = url.searchParams.get('page');
	const feedParam = url.searchParams.get('feed');
	const networkID = url.searchParams.get('network');
	if (!networkID) return json({ error: 'Network not found' });

	const { facts, totalFacts, totalPages } = await getFactsPage(
		locals.pb,
		networkID,
		pageParam !== null ? parseInt(pageParam) : 1,
		feedParam
	);

	return json({ facts, totalFacts, totalPages });
};
