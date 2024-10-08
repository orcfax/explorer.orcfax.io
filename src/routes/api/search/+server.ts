import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchFactStatements, searchFeeds } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	const networkID = url.searchParams.get('network');
	if (!query) return json({ error: 'Query parameter is missing' }, { status: 400 });
	if (!networkID) return json({ error: 'Network parameter is missing' }, { status: 400 });

	try {
		const factStatements = await searchFactStatements(networkID, query);
		const feeds = await searchFeeds(networkID, query);

		return json({
			factStatements,
			feeds
		});
	} catch (error) {
		console.error('Error querying PocketBase:', error);
		return json({ error: 'Error querying database' }, { status: 500 });
	}
};
