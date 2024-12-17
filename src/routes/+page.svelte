<script lang="ts">
	import FactTable from '$lib/components/FactTable.svelte';
	import FeedsList from '$lib/components/FeedsList.svelte';
	import FeedsListLoadingSkeleton from '$lib/components/FeedsListLoadingSkeleton.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import NetworkSummary from '$lib/components/NetworkSummary.svelte';
	import SourceTable from '$lib/components/SourceTable.svelte';

	export let data;
</script>

<main class="flex flex-col items-center w-full px-10 min-h-full overflow-x-hidden">
	<NetworkSummary summary={data.summary} />
	<div class="w-full max-w-max md:mt-6">
		<section id={`oracleFeedsList`} class="flex flex-col items-center mt-14">
			<h2 class="font-bold text-3xl pb-4 self-start">Oracle Feeds</h2>
			{#await data.feeds}
				<FeedsListLoadingSkeleton />
			{:then feeds}
				<FeedsList {feeds} />
			{/await}
		</section>

		<section id={`allFactsTable`} class="hidden sm:flex flex-col mt-14">
			<h1 class="font-bold text-3xl pb-4">All Fact Statements</h1>
			<div class="section-container p-7">
				<FactTable />
			</div>
		</section>

		{#await data.summary.sources}
			<Loading />
		{:then sources}
			<section id={`sources`} class="hidden sm:flex flex-col mt-14">
				<h1 class="font-bold text-3xl pb-4">All Sources</h1>
				<div class="section-container p-7">
					<SourceTable {sources} />
				</div>
			</section>
		{/await}

		{#await data.summary.nodes}
			<Loading />
		{:then nodes}
			<section id={`nodes`} class="hidden sm:flex flex-col mt-14">
				<h1 class="font-bold text-3xl pb-4">All Nodes</h1>
				<div class="section-container p-7">
					<!-- <SourceTable {sources} /> -->
				</div>
			</section>
		{/await}
	</div>
</main>
