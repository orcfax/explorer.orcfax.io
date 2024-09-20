<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		getFeedChartRange,
		type DBFactStatement,
		type FactStatement,
		type Feed,
		type FeedRange
	} from '$lib/types';
	import { writable } from 'svelte/store';
	import ChartRangeSelect from './ChartRangeSelect.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PriceLineChart from './PriceLineChart.svelte';
	import { formatFactStatementsForDisplay } from '$lib/client/helpers';
	import FeedChartLoadingSkeleton from './FeedChartLoadingSkeleton.svelte';

	export let feed: Feed;
	export let selectedFact: FactStatement;
	export let chartFacts: DBFactStatement[];
	export let onChartPointClick: (fact: FactStatement) => void;

	let isLoading = false;

	$: facts = formatFactStatementsForDisplay(chartFacts, feed);

	const range = writable<FeedRange>('1');
	page.subscribe((value) => {
		range.set(getFeedChartRange(value.url.searchParams.get('range')));
	});

	async function handleRangeSelect(value: string | undefined) {
		isLoading = true;
		const params = new URLSearchParams($page.url.searchParams);
		const newRange = getFeedChartRange(value);
		range.set(newRange);
		params.set('range', newRange);
		await goto(`?${params.toString()}`);
		isLoading = false;
	}

	let innerWidth = 0;
	let innerHeight = 0;

	$: isMobile = innerWidth < 640;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if isLoading}
	<FeedChartLoadingSkeleton />
{:else if facts.length < 1}
	<div>Unable to display feed price chart...</div>
{:else}
	<div
		class="flex flex-col justify-center items-center w-full relative border border-t-0 rounded-lg rounded-t-none p-2 md:p-6 pt-0 md:pt-0"
	>
		<div class="flex justify-start items-center space-x-2 w-full">
			<ChartRangeSelect class="self-end my-4" value={$range} onChange={handleRangeSelect} />
			<Badge variant="outline" class="flex">
				<p class="text-card-foreground text-opacity-70">
					Showing {facts.length} of {feed.totalFacts} <span class="inline xs:hidden">Facts</span>
					<span class="hidden xs:inline">Fact Statements</span>
				</p>
			</Badge>
		</div>

		<PriceLineChart
			{facts}
			{selectedFact}
			onPointClick={onChartPointClick}
			range={$range}
			{isMobile}
		/>
	</div>
{/if}
