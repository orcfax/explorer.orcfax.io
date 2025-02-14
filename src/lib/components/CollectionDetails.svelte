<script lang="ts">
	import type { Archive } from '$lib/types';
	import FactCardField from './FactCardField.svelte';
	import SourceBadge from './SourceBadge.svelte';
	import SourceTable from './SourceTable.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { networkStore } from '$lib/stores/network';

	export let archive: Promise<Archive> | null;

	const { network } = $networkStore;
</script>

<section class="w-fit md:w-full xl:w-fit flex flex-col xl:self-start">
	<h3 class="hidden md:inline font-bold text-xl pb-4">Collection</h3>
	{#await archive}
		<Skeleton class="h-[45rem] w-[25rem]" />
	{:then archive}
		<div class="p-6 space-y-6 section-container bg-card text-card-foreground">
			{#if archive && archive.details}
				{@const isCEX = archive.details.sourceType === 'CEX'}
				{@const sortedSources = archive.details.sources.sort(
					(a, b) => (a.assetPairValue ?? 0) - (b.assetPairValue ?? 0)
				)}
				<div class="grid grid-cols-1 xs:grid-cols-2 gap-4">
					<FactCardField name="Collecting Timestamp" value={archive.details.collectionTimestamp} />
					<FactCardField
						name="Collector Node ID"
						value={archive.details.collectorNodeID}
						ellipsisAndHover
					/>
				</div>
				<div class={`flex flex-col ${isCEX ? 'items-center' : ''}`}>
					<h4 class="font-bold pb-4">Primary Sources:</h4>
					<div class="hidden xs:flex space-x-6">
						<SourceTable sources={isCEX ? sortedSources : archive.details.sources} showWithValues />
					</div>
					<ol class="flex xs:hidden">
						{#each isCEX ? sortedSources : archive.details.sources as source, index (source.id)}
							<li class={`${index !== 0 ? '-ml-4' : ''}`}>
								<SourceBadge {source} />
							</li>
						{/each}
					</ol>
					<p class="inline xs:hidden mt-2 text-xs text-muted-foreground">
						{archive.details.sources.length} sources
					</p>
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
	{/await}
</section>
