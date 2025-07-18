import { error } from '@sveltejs/kit';
import { getAllNetworks, getFeeds } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';
import { toTitleCase } from '$lib/client/helpers';
import { DEFAULT_NETWORK_NAME } from '../lib/stores/network';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const subdomain = url.hostname.split('.')[0];
	const isValidNetworkName = ['mainnet', 'preview'].includes(subdomain);
	const networkName = isValidNetworkName ? toTitleCase(subdomain) : DEFAULT_NETWORK_NAME;
	const networks = await getAllNetworks(locals.pb);
	const network = networks.find((n) => n.name === networkName);
	if (!network) error(404, `Network not found`);

	return {
		network,
		networks,
		// Lazy load / stream feeds
		feeds: getFeeds(network)
	};
};
