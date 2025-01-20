<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { type DBFactStatement, type FactStatement, type Feed } from '$lib/types';
	import ChartRangeSelect from './ChartRangeSelect.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PriceLineChart from './PriceLineChart.svelte';
	import FeedChartLoadingSkeleton from './FeedChartLoadingSkeleton.svelte';
	import { formatFactStatementForDisplay, getFeedChartRange } from '$lib/client/helpers';

	interface Props {
		feed: Feed;
		selectedFact: FactStatement | null;
		chartFacts: DBFactStatement[];
		onChartPointClick: (fact: FactStatement) => void;
	}

	let { feed, selectedFact, chartFacts, onChartPointClick }: Props = $props();

	let isLoading = $state(false);

	let facts = $derived(chartFacts.map((fact) => formatFactStatementForDisplay(fact, feed)));

	const range = $derived.by(() => {
		return getFeedChartRange(page.url.searchParams.get('range'));
	});

	async function handleRangeSelect(value: string | undefined) {
		isLoading = true;
		const params = new URLSearchParams(page.url.searchParams);
		params.set('range', getFeedChartRange(value));
		await goto(`?${params.toString()}`);
		isLoading = false;
	}

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	let isMobile = $derived(innerWidth < 640);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if isLoading}
	<FeedChartLoadingSkeleton />
{:else if facts.length < 1}
	<div
		class="flex flex-col justify-center items-center w-full relative border border-t-0 rounded-lg rounded-t-none p-2 md:p-6 pt-0 md:pt-0"
	>
		<p class="mt-4">Unable to display feed price chart...</p>
	</div>
{:else}
	<div
		class="flex flex-col justify-center items-center w-full relative border border-t-0 rounded-lg rounded-t-none p-2 md:p-6 pt-0 md:pt-0"
	>
		<div class="flex justify-start items-center space-x-2 w-full">
			<ChartRangeSelect class="self-end my-4" value={range} onChange={handleRangeSelect} />
			<Badge variant="outline" class="flex">
				<p class="text-card-foreground text-opacity-70">
					<span class="hidden xxs:inline">Showing</span>
					{facts.length} of {feed.totalFacts} <span class="inline xs:hidden">Facts</span>
					<span class="hidden xs:inline">Fact Statements</span>
				</p>
			</Badge>
		</div>

		{#if selectedFact}
			<PriceLineChart {facts} {selectedFact} onPointClick={onChartPointClick} {range} {isMobile} />
		{/if}
	</div>
{/if}
