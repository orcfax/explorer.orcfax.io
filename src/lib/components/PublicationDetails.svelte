<script lang="ts">
	import type { FactStatement } from '$lib/types';
	import { getSmartContractUrl, getTransactionIDUrl, networkStore } from '$lib/stores/network';
	import FactCardField from './FactCardField.svelte';

	export let fact: FactStatement;

	let innerWidth = 0;
	let innerHeight = 0;

	$: maxFieldLength = innerWidth < 780 ? 20 : 22;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<section class="w-fit md:w-full flex flex-col">
	<h3 class="font-bold text-2xl pb-4">Publication Details</h3>
	<div class="p-6 section-container bg-card text-card-foreground">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
			<FactCardField
				name="Tx ID"
				value={fact.transaction_id}
				allowCopyToClipboard
				ellipsisAndHover
				accessoryLink={{
					text: 'View Transaction →',
					link: getTransactionIDUrl($networkStore.network, fact.transaction_id)
				}}
				{maxFieldLength}
			/>
			<FactCardField
				name="Smart Contract Addr"
				value={$networkStore.network.cardano_smart_contract_address}
				allowCopyToClipboard
				ellipsisAndHover
				accessoryLink={{
					text: 'View Contract →',
					link: getSmartContractUrl($networkStore.network)
				}}
				{maxFieldLength}
			/>
			<FactCardField
				name="Policy ID"
				value={`${$networkStore.network.policies[0].policy_id} `}
				allowCopyToClipboard
				ellipsisAndHover
				accessory=""
			/>

			<FactCardField name="Output Index" value={`${fact.output_index} `} accessory="" />
			<FactCardField name="Slot" value={`${fact.slot} `} accessory="" />
			<FactCardField
				name="Block Hash"
				value={`${fact.block_hash} `}
				allowCopyToClipboard
				ellipsisAndHover
				accessory=""
			/>
			<FactCardField
				name="Publication Date"
				value={`${fact.publication_date_formatted} ${fact.publication_time_formatted}`}
				accessory=""
			/>
			<FactCardField
				name="Tx Publication Cost"
				value={`${fact.publication_cost} ADA`}
				accessory=""
			/>
		</div>
	</div>
</section>
