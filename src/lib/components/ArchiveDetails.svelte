<script lang="ts">
	import { networkStore } from '$lib/stores/network';
	import type { FactStatement } from '$lib/types';
	import FactCardField from '$lib/components/FactCardField.svelte';

	export let fact: FactStatement | null;

	const { network } = $networkStore;

	let innerWidth = 0;
	let innerHeight = 0;

	$: maxFieldLength = innerWidth < 780 ? 13 : 15;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<section class="w-fit md:w-full flex flex-col self-start">
	<h3 class="hidden md:inline font-bold text-xl pb-4">Archival</h3>
	<div class="p-6 section-container bg-card text-card-foreground">
		{#if fact && fact.storage_urn}
			<div class="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-4">
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
					{maxFieldLength}
				/>
				<FactCardField name="Storage Cost" value={`-`} accessory="" />
			</div>
		{:else if network.name === "Preview"}
			<div class="flex flex-col">
				<h4 class="text-lg">Unavailable for this network</h4>
			</div>
		{:else}
			<div class="flex flex-col">
				<h4 class="font-bold text-lg">Data Unavailable</h4>
				<p>Please check back later.</p>
			</div>
		{/if}
	</div>
</section>
