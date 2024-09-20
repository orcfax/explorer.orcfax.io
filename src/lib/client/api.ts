import { type GetFactsPageResponse, type Network } from '$lib/types';
import { formatFactStatementsForDisplay } from '$lib/client/helpers';

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

	return {
		facts: formatFactStatementsForDisplay(res.facts),
		totalFacts: res.totalFacts,
		totalPages: res.totalPages
	};
}
