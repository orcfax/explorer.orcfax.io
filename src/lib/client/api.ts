import { type GetFactsPageResponse, type Network, GetFactsPageResponseDBSchema } from '$lib/types';
import { formatFactStatementForDisplay } from './helpers';

export async function getTableResults(
	page: number,
	network: Network,
	feed_id?: string
): Promise<GetFactsPageResponse> {
	const response = await fetch(
		`/api/facts?page=${page}&network=${network.id}${feed_id ? `&feed=${feed_id}` : ''}`,
		{
			method: 'GET'
		}
	);
	const res = await response.json();
	const data = GetFactsPageResponseDBSchema.parse(res);

	return {
		facts: data.facts.map((fact) => formatFactStatementForDisplay(fact, fact.feed)),
		totalFacts: res.totalFacts,
		totalPages: res.totalPages
	};
}

export async function logError(message: string, error?: unknown) {
	await fetch('/api/logError', {
		method: 'POST',
		body: JSON.stringify({ message, error })
	});
}
