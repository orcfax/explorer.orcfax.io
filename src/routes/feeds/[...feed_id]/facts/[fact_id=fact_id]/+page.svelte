<script lang="ts">
	import FactTable from '$lib/components/FactTable.svelte';
	import FeedSummary from '../../components/FeedSummary.svelte';
	import { Separator } from 'bits-ui';

	import { type FactStatement } from '$lib/types';
	import {
		formatFactStatementForDisplay,
		formatFeedForDisplay,
		getFeedUrl
	} from '$lib/client/helpers';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import ArchiveDetails from '$lib/components/ArchiveDetails.svelte';
	import FactSummary from '$lib/components/FactSummary.svelte';
	import PublicationDetails from '$lib/components/PublicationDetails.svelte';
	import ArchiveExplorer from '$lib/components/ArchiveExplorer.svelte';
	import { ArrowLeft } from 'lucide-svelte';
	import FeedChart from '../../components/FeedChart.svelte';
	import CollectionDetails from '$lib/components/CollectionDetails.svelte';
	import CalculationDetails from '$lib/components/CalculationDetails.svelte';
	import ValidationDetails from '$lib/components/ValidationDetails.svelte';
	import FactStatementDetailsAccordion from '$lib/components/FactStatementDetailsAccordion.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { feedsListStore } from '$lib/stores/feedsList';

	export let data;
	feedsListStore.set(data.feeds);

	let factSummary: HTMLElement;
	let selectedFact: FactStatement | null = data.selectedFact
		? formatFactStatementForDisplay(data.selectedFact, data.feed)
		: null;

	$: feed = formatFeedForDisplay(data.feed);
	$: chartFacts = data.chartFacts;
	$: archive = data.archive;
	$: riskRatings = data.riskRatings;

	async function handleSelectedFactChange(newFactStatement: FactStatement | null) {
		const params = new URLSearchParams($page.url.searchParams);
		selectedFact = newFactStatement;
		factSummary.scrollIntoView({ behavior: 'smooth' });
		await goto(
			`${getFeedUrl(feed, newFactStatement ? newFactStatement.fact_urn : 'undefined')}?${params.toString()}`,
			{
				noScroll: true
			}
		);
	}
</script>

<div
	class="flex flex-col justify-center items-center w-full max-w-screen-xl mx-auto px-4 md:px-10 space-y-14"
>
	<div class="flex flex-col justify-center items-center w-full">
		<a
			href="/"
			class="flex justify-center gap-2 self-start text-sm items-center -mt-2 mb-4 rounded-lg border text-muted-foreground bg-card hover:scale-[1.008] hover:text-card-foreground py-2 px-3"
		>
			<ArrowLeft />
			<span>Back to dashboard</span>
		</a>
		<h1 class="font-bold text-3xl pb-4 self-start">Feed Summary</h1>
		<FeedSummary
			onFeedSwitch={(feed) => {
				if (feed)
					selectedFact = feed.latestFact
						? formatFactStatementForDisplay(feed.latestFact, feed)
						: null;
			}}
			{feed}
			{riskRatings}
			onLatestFactClick={handleSelectedFactChange}
		/>
		<FeedChart {feed} {selectedFact} {chartFacts} onChartPointClick={handleSelectedFactChange} />
	</div>

	<section class="flex flex-col w-full rounded-lg">
		<h2 bind:this={factSummary} class="font-bold text-3xl pb-4 scroll-m-28">
			Selected Fact <span class="hidden xs:inline">Statement</span>
		</h2>
		<div class="section-container space-y-10 flex flex-col items-center w-full">
			<div
				class="flex flex-col w-full items-start space-y-8 md:justify-around md:items-center lg:space-x-8 lg:space-y-0 lg:flex-row lg:justify-evenly"
			>
				<div class="lg:sticky lg:top-28 self-center lg:self-start -mt-6 xxxs:-mt-0">
					{#if selectedFact}
						<FactSummary {feed} fact={selectedFact} />
					{:else}
						<div
							class="flex flex-col justify-center items-center w-full rounded-lg bg-card text-card-foreground border"
						>
							<p class="p-12 w-fit font-extrabold">No Fact Statement selected.</p>
						</div>
					{/if}
				</div>
				<div class="hidden md:flex md:flex-col md:space-y-4">
					<h4 class="font-bold text-2xl">Fact Statement Details</h4>
					<div class="space-y-8 flex flex-col self-center border rounded-lg p-8">
						<div
							class="flex flex-col md:items-center space-y-8 xl:flex-row xl:space-x-8 xl:space-y-0 xl:justify-evenly"
						>
							<CollectionDetails {archive} />
							<div
								class="flex flex-col space-y-8 md:flex-row md:space-x-8 md:space-y-0 xl:flex-col xl:space-x-0 xl:space-y-8 xl:self-start"
							>
								<CalculationDetails {archive} />
								<ValidationDetails {archive} />
							</div>
						</div>

						<PublicationDetails fact={selectedFact} />
						<ArchiveDetails fact={selectedFact} />
					</div>
				</div>

				<div class="flex w-full md:hidden">
					<FactStatementDetailsAccordion {archive} fact={selectedFact} />
				</div>
			</div>

			{#if selectedFact?.is_archive_indexed}
				{#await data.archive}
					<Skeleton class="h-[80rem] w-full" />
				{:then archive}
					<ArchiveExplorer {archive} isArchiveIndexed={selectedFact?.is_archive_indexed ?? false} />
				{:catch}
					<div
						class="flex flex-col justify-center items-center text-center sm:text-start w-full rounded-lg bg-card text-card-foreground border"
					>
						<h4 class="text-lg pt-12 px-12 w-fit font-extrabold">
							Failed to fetch Fact Statement archive
						</h4>
						<p class="pb-12 px-12 w-fit">Please check back or refresh in a few minutes.</p>
					</div>
				{/await}
			{:else}
				<div
					class="flex flex-col justify-center items-center text-center sm:text-start w-full rounded-lg bg-card text-card-foreground border"
				>
					<h4 class="text-lg pt-12 px-12 w-fit font-extrabold">
						Fact Statement not archived on Arweave yet
					</h4>
					<p class="pb-12 px-12 w-fit">Please check back later.</p>
				</div>
			{/if}
		</div>
	</section>

	<Separator.Root class="mx-4 h-[1px] bg-border w-full" decorative />

	<section id={`feed_facts_table`} class="hidden md:flex flex-col w-full">
		<h2 class="font-bold text-3xl pb-4">
			{`All ${feed.name} Fact Statements`}
		</h2>
		<div class="section-container p-7">
			<FactTable feedFilter={feed.feed_id} />
		</div>
	</section>
</div>
