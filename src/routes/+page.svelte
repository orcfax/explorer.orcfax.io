<script lang="ts">
	import FactTable from '$lib/components/FactTable.svelte';
	import FeedsList from '$lib/components/FeedsList.svelte';
	import FeedsListLoadingSkeleton from '$lib/components/FeedsListLoadingSkeleton.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import NetworkSummary from '$lib/components/NetworkSummary.svelte';
	import NetworkSummaryLoadingSkeleton from '$lib/components/NetworkSummaryLoadingSkeleton.svelte';
	import NodesTable from '$lib/components/NodesTable.svelte';
	import SourceTable from '$lib/components/SourceTable.svelte';

	export let data;
</script>

<main class="flex flex-col items-center w-full px-10 min-h-full overflow-x-hidden">
	{#await Promise.all([
		data.totalFacts,
		data.totalFacts24Hour,
		data.totalActiveFeeds,
		data.nodes,
		data.sources,
		data.statusInfo
	])}
		<NetworkSummaryLoadingSkeleton />
	{:then summary}
		<NetworkSummary
			summary={{
				totalFacts: summary[0],
				totalFacts24Hour: summary[1],
				totalActiveFeeds: summary[2],
				nodes: summary[3],
				sources: summary[4]
			}}
			latestNetworkUpdate={summary[5].latestNetworkUpdate}
			activeIncidents={summary[5].activeIncidents}
		/>
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

		<section id={`facts`} class="hidden sm:flex flex-col mt-14 scroll-mt-24">
			<h1 class="font-bold text-3xl pb-4">All Fact Statements</h1>
			<div class="section-container p-7">
				<FactTable />
			</div>
		</section>

		{#await data.nodes}
			<Loading />
		{:then nodes}
			<section id={`nodes`} class="hidden sm:flex flex-col mt-14 scroll-mt-24">
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
			<Loading />
		{:then sources}
			<section id={`sources`} class="hidden sm:flex flex-col mt-14 scroll-mt-24">
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
