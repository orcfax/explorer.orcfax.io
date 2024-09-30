<script lang="ts">
	import type { Archive } from '$lib/types';
	import FactCardField from './FactCardField.svelte';
	import SourceTable from './SourceTable.svelte';

	export let archive: Promise<Archive>;
</script>

{#await archive then archive}
	{#if archive.sources}
		{@const isCEX = archive.sources.length > 0 && archive.sources[0].type === 'CEX API'}
		{@const sortedSources = archive.sources.sort(
			(a, b) => (a.assetPairValue ?? 0) - (b.assetPairValue ?? 0)
		)}
		<section class="w-full md:w-fit flex flex-col">
			<h3 class="font-bold text-2xl pb-4">Collection Details</h3>
			<div class="p-6 space-y-6 section-container bg-card text-card-foreground">
				<div class={`flex flex-col ${isCEX ? 'items-center' : ''}`}>
					<h4 class="font-bold text-xl pb-4">Sources</h4>
					<div class="flex space-x-6">
						{#if archive.sources && archive.sources.length > 0}
							<SourceTable sources={isCEX ? sortedSources : archive.sources} showWithValues />
						{:else}
							<p>Source data unavailable</p>
						{/if}
					</div>
				</div>
				<div class="flex flex-col items-center space-y-6 md:flex-row md:space-x-8 md:space-y-0">
					<FactCardField
						name="Collecting Timestamp"
						value={archive.validationDetails?.collectionTimestamp ?? '-'}
					/>
					<FactCardField
						name="Collector Node ID"
						value={archive.validationDetails?.collectorNodeID ?? '-'}
						ellipsisAndHover
					/>
				</div>
			</div>
		</section>
	{/if}
{/await}
