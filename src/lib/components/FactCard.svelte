<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { FactStatement } from '$lib/types';
	import FactCardField from './FactCardField.svelte';
	import OpenFolder from '$lib/icons/OpenFolder.svelte';
	import BlockchainBadges from './BlockchainBadges.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';

	export let fact: FactStatement;
	$: timeSincePublished = createTimeSinceStore(fact.publication_date);
</script>

<li class="carousel-item" transition:fly={{ x: 200, duration: 1000 }}>
	<a
		class="card w-17rem shadow-md border border-gray-300 rounded-lg bg-secondary hover:border-gray-400"
		href={fact.fact_urn}
	>
		<div class="card-body p-4 gap-0 relative">
			<h2 class="text-lg self-center font-semibold">The price of</h2>
			<h2 class="self-center font-extrabold text-primary whitespace-nowrap">
				{fact.description}
			</h2>
			<h3 class="text-base text-center font-medium">on {fact.validation_date_formatted}</h3>
			<h3 class="text-base text-center font-medium">at {fact.validation_time_formatted}</h3>
			<div class="divider my-2" />
			<div class="flex flex-col p-2 pt-0 pb-2 gap-3">
				<FactCardField
					name="Fact Statement ID"
					value={fact.id}
					ellipsisAndHover
					allowCopyToClipboard
				/>
				<FactCardField
					name="Feed"
					value={typeof fact.feed === 'string' ? 'N/A' : fact.feed.name}
					accessory={typeof fact.feed === 'string' ? 'N/A' : fact.feed.type}
				/>
				<FactCardField name="Value" value={`${fact.value}`} ellipsisAndHover />
				<FactCardField
					name="Publication Date"
					value={`${fact.publication_date_formatted} ${fact.publication_time_formatted}`}
					accessory={$timeSincePublished}
				/>
			</div>
			<BlockchainBadges {fact} class="mt-2 -ml-4 -mb-2" />
			<div class="tooltip absolute bottom-2 right-2" data-tip="View Full Fact Statement">
				<OpenFolder fillColor={'fill-gray-500'} />
			</div>
		</div>
	</a>
</li>
