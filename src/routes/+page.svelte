<script lang="ts">
	import FactTable from '$lib/components/FactTable.svelte';
	import FeedsList from '$lib/components/FeedsList.svelte';
	import FeedsListLoadingSkeleton from '$lib/components/FeedsListLoadingSkeleton.svelte';
	import NetworkSummary from '$lib/components/NetworkSummary.svelte';
	import NetworkSummaryLoadingSkeleton from '$lib/components/NetworkSummaryLoadingSkeleton.svelte';
	import NodesTable from '$lib/components/NodesTable.svelte';
	import NodesTableLoadingSkeleton from '$lib/components/NodesTableLoadingSkeleton.svelte';
	import SourceTable from '$lib/components/SourceTable.svelte';
	import SourceTableLoadingSkeleton from '$lib/components/SourceTableLoadingSkeleton.svelte';

	export let data;
</script>

<main class="flex flex-col items-center w-full px-10 min-h-full overflow-x-hidden">
	{#await data.dashboard}
		<NetworkSummaryLoadingSkeleton />
	{:then dashboard}
		{#if dashboard}
			<NetworkSummary summary={dashboard} />
		{:else}
			<p>Error retrieving network summary</p>
		{/if}
	{/await}
	<div class="w-full max-w-max md:mt-6">
		<section id={`feeds`} class="flex flex-col items-center mt-14 scroll-mt-24">
			<h2 class="font-bold text-3xl pb-4 self-start">Oracle Feeds</h2>
			{#await data.feeds}
				<FeedsListLoadingSkeleton />
			{:then feeds}
				<FeedsList {feeds} />
			{/await}
		</section>

		<section id={`facts`} class="flex-col mt-14 scroll-mt-24">
			<h1 class="font-bold text-3xl pb-4">All Fact Statements</h1>
			<div class="section-container p-7">
				<FactTable />
			</div>
		</section>

		{#await data.nodes}
			<section id={`nodes`} class="flex-col mt-14 scroll-mt-24">
				<h1 class="font-bold text-3xl pb-4">All Nodes</h1>
				<div class="section-container p-7">
					<NodesTableLoadingSkeleton />
				</div>
			</section>
		{:then nodes}
			<section id={`nodes`} class="flex-col mt-14 scroll-mt-24">
				<h1 class="font-bold text-3xl pb-4">All Nodes</h1>
				<div class="section-container p-7">
					{#if data.network.name === 'Preview'}
						<p>Node data unavailable for this network</p>
					{:else}
						<NodesTable {nodes} />
					{/if}
				</div>
			</section>
		{/await}

		{#await data.sources}
			<section id={`sources`} class="flex-col mt-14 scroll-mt-24">
				<h1 class="font-bold text-3xl pb-4">All Sources</h1>
				<div class="section-container p-7">
					<SourceTableLoadingSkeleton />
				</div>
			</section>
		{:then sources}
			<section id={`sources`} class="flex-col mt-14 scroll-mt-24">
				<h1 class="font-bold text-3xl pb-4">All Sources</h1>
				<div class="section-container p-7">
					{#if data.network.name === 'Preview'}
						<p>Source data unavailable for this network</p>
					{:else}
						<SourceTable {sources} />
					{/if}
				</div>
			</section>
		{/await}
	</div>
</main>
