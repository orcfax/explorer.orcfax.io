<script lang="ts">
	import { formatCurrencyValue, formatValue } from '$lib/client/helpers';
	import type { Archive, Source } from '$lib/types';
	import { Divide, Equal } from 'lucide-svelte';
	import FactCardField from './FactCardField.svelte';

	export let archive: Promise<Archive>;

	function getMedianAssetPairValue(sources: Source[]): number | null {
		if (sources.length === 0) {
			return null;
		}

		// Extract assetPairValue from each source
		const values = sources.map((source) => source.assetPairValue ?? 0);

		// Sort values in ascending order
		values.sort((a, b) => a - b);

		const midIndex = Math.floor(values.length / 2);

		// If odd, return the middle value
		if (values.length % 2 !== 0) {
			return values[midIndex];
		}

		// If even, return the average of the two middle values
		const mid1 = values[midIndex - 1];
		const mid2 = values[midIndex];
		return (mid1 + mid2) / 2;
	}
</script>

{#await archive then archive}
	{#if archive.sources}
		{@const baseAssetValueSum = archive.sources.reduce(
			(acc, source) => acc + (source.baseAssetValue || 0),
			0
		)}
		{@const quoteAssetValueSum = archive.sources.reduce(
			(acc, source) => acc + (source.quoteAssetValue || 0),
			0
		)}
		{@const isCEX = archive.sources.length > 0 && archive.sources[0].type === 'CEX API'}
		{@const isDEX = archive.sources.length > 0 && archive.sources[0].type === 'DEX LP'}

		<section class="w-full max-w-72 flex flex-col">
			<h3 class="font-bold text-2xl pb-4">Calculation Details</h3>
			<div class="p-6 section-container bg-card text-card-foreground">
				<div class="grid grid-cols-1 md:grid-cols-1 gap-4">
					{#if archive.sources && archive.sources.length > 0}
						<FactCardField
							name="Calculation Method"
							value={archive.validationDetails?.calculationMethod ?? '-'}
						/>
						{#if isCEX}
							{@const midIndex = Math.floor(archive.sources.length / 2)}
							{@const isOddSources = archive.sources.length % 2 !== 0}
							{#if isOddSources}
								<FactCardField
									name="Median Value"
									value={getMedianAssetPairValue(archive.sources) ?? 0}
								/>
							{:else}
								<div
									class="flex flex-col items-center bg-secondary/90 border p-3 rounded-lg space-y-3"
								>
									<FactCardField
										name="Middle Values"
										value={`( ${archive.sources[midIndex - 1].assetPairValue} + ${archive.sources[midIndex].assetPairValue} )`}
									/>
									<Divide />
									<span>2</span>
									<Equal />
									<FactCardField
										name="Median Value"
										value={getMedianAssetPairValue(archive.sources) ?? 0}
									/>
								</div>
							{/if}
						{:else if isDEX}
							<div
								class="flex flex-col items-center bg-secondary/90 border p-3 rounded-lg space-y-3"
							>
								<FactCardField name="Quote Sum" value={formatValue(quoteAssetValueSum)} />
								<Divide />
								<FactCardField name="Base Sum" value={formatValue(baseAssetValueSum)} />
								<Equal />
								<FactCardField
									name="Final Value"
									value={formatCurrencyValue(quoteAssetValueSum / baseAssetValueSum)}
								/>
							</div>
						{/if}
					{:else}
						<p>Source data unavailable</p>
					{/if}
				</div>
			</div>
		</section>
	{/if}
{/await}
