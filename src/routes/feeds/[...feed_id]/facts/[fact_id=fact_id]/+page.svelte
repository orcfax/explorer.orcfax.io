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

	export let data;

	let factSummary: HTMLElement;
	let selectedFact: FactStatement = formatFactStatementForDisplay(data.selectedFact, data.feed);

	$: feed = formatFeedForDisplay(data.feed);
	$: chartFacts = data.chartFacts;
	$: archive = data.archive;

	async function handleSelectedFactChange(newFactStatement: FactStatement) {
		const params = new URLSearchParams($page.url.searchParams);
		selectedFact = newFactStatement;
		factSummary.scrollIntoView({ behavior: 'smooth' });
		await goto(`${getFeedUrl(feed, newFactStatement.fact_urn)}?${params.toString()}`, {
			noScroll: true
		});
	}
</script>

<div class="flex flex-col justify-center items-center w-full px-4 md:px-10 space-y-14">
	<div class="flex flex-col justify-center items-center w-full">
		<a
			href="/"
			class="flex justify-center gap-2 self-start text-sm items-center -mt-2 mb-4 -ml-4 rounded-lg border text-muted-foreground bg-card hover:scale-[1.008] hover:text-card-foreground py-2 px-3"
		>
			<ArrowLeft />
			<span>Back to dashboard</span>
		</a>
		<h1 class="font-bold text-3xl pb-4 self-start">Feed Summary</h1>
		<FeedSummary
			onFeedSwitch={(feed) => {
				if (feed) selectedFact = formatFactStatementForDisplay(feed.latestFact, feed);
			}}
			{feed}
			feeds={data.feeds}
			onLatestFactClick={handleSelectedFactChange}
		/>
		<FeedChart {feed} {selectedFact} {chartFacts} onChartPointClick={handleSelectedFactChange} />
	</div>

	<section class="flex flex-col w-full rounded-lg">
		<h2 bind:this={factSummary} class="font-bold text-3xl pb-4 scroll-m-28">
			Selected Fact <span class="hidden xs:inline">Statement</span>
		</h2>
		<div class="section-container p-7 space-y-10 flex flex-col items-center w-full">
			<div
				class="flex flex-col w-full items-center space-y-8 lg:space-x-8 md:flex-row md:justify-around"
			>
				<FactSummary {feed} fact={selectedFact} />
				<div class="flex flex-col space-y-8">
					{#await archive then archive}
						<CollectionDetails {archive} />
					{/await}
					<PublicationDetails fact={selectedFact} />
					<div class="hidden lg:block">
						<ArchiveDetails fact={selectedFact} />
					</div>
				</div>
			</div>
			<div class="block lg:hidden">
				<ArchiveDetails fact={selectedFact} />
			</div>

			{#await data.archive}
				<div
					class="flex flex-col justify-center items-center text-center w-full rounded-lg bg-card text-card-foreground border"
				>
					<p class="pt-12 px-12 w-fit font-extrabold">
						This Fact Statement has not been archived on Arweave yet.
					</p>
					<p class="pb-12 px-12 w-fit">Please check back or refresh in a few minutes.</p>
				</div>
			{:then archive}
				<ArchiveExplorer {archive} fact={selectedFact} />
			{:catch}
				<div
					class="flex flex-col justify-center items-center text-center w-full rounded-lg bg-card text-card-foreground border"
				>
					<p class="pt-12 px-12 w-fit font-extrabold">
						This Fact Statement has not been archived on Arweave yet.
					</p>
					<p class="pb-12 px-12 w-fit">Please check back or refresh in a few minutes.</p>
				</div>
			{/await}
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
