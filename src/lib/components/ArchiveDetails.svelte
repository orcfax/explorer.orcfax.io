<script lang="ts">
	import { networkStore } from '$lib/stores/network';
	import type { FactStatement } from '$lib/types';
	import FactCardField from '$lib/components/FactCardField.svelte';

	export let fact: FactStatement;

	let innerWidth = 0;
	let innerHeight = 0;

	$: maxFieldLength = innerWidth < 780 ? 20 : 22;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<section class="w-full md:w-fit flex flex-col self-start">
	<h3 class="font-bold text-2xl pb-4">Archival Details</h3>
	<div class="p-6 section-container bg-card text-card-foreground">
		<div class="flex flex-wrap gap-4 w-fit">
			<FactCardField
				name="Arweave Tx ID"
				value={fact.storage_urn}
				allowCopyToClipboard
				ellipsisAndHover
				accessoryLink={fact.storage_urn
					? {
							text: 'View Transaction →',
							link: `https://viewblock.io/arweave/tx/${fact.storage_urn.slice(12)}`
						}
					: null}
				{maxFieldLength}
			/>
			<FactCardField
				name="Arweave Wallet Addr"
				value={$networkStore.network.arweave_wallet_address}
				allowCopyToClipboard
				ellipsisAndHover
				accessoryLink={{
					text: 'View Wallet →',
					link: `https://viewblock.io/arweave/address/${$networkStore.network.arweave_wallet_address}`
				}}
				maxFieldLength={maxFieldLength - 3}
			/>
			<FactCardField name="Storage Cost" value={`N/A`} accessory="" />
		</div>
	</div>
</section>
