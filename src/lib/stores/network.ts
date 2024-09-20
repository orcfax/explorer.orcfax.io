import { writable } from 'svelte/store';
import type { Network } from '$lib/types';

export const DEFAULT_NETWORK_NAME = 'Mainnet';
export const VALID_NETWORK_SUBDOMAINS = ['preview', 'mainnet'];

export function getSmartContractUrl(network: Network): string {
	return `${network.block_explorer_base_url}/address/${network.cardano_smart_contract_address}/tx#data`;
}

export function getTransactionIDUrl(network: Network, txId: string): string {
	return `${network.block_explorer_base_url}/tx/${txId}`;
}

export function getArweaveUrl(network: Network, storage_urn: string): string {
	const arweaveTxID = storage_urn.slice(12);
	return `${network.arweave_explorer_base_url}/${arweaveTxID}`;
}

// Create a writable store to manage the network across the app
export const networkStore = writable<{ network: Network; networks: Network[] }>();
