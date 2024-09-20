<script lang="ts">
	import { formatFeedForDisplay } from '$lib/client/helpers';
	import FactTable from '$lib/components/FactTable.svelte';
	import FeedsList from '$lib/components/FeedsList.svelte';
	import NetworkSummary from '$lib/components/NetworkSummary.svelte';

	export let data;

	$: feeds = data.feeds.map(formatFeedForDisplay);
</script>

<main class="flex flex-col items-center w-full px-10 min-h-full overflow-x-hidden">
	<NetworkSummary summary={data.summary} />
	<div class="w-full max-w-max md:mt-6">
		<section id={`oracleFeedsList`} class="flex flex-col items-center mt-14">
			<h2 class="font-bold text-3xl pb-4 self-start">Oracle Feeds</h2>
			<FeedsList {feeds} />
		</section>

		<section id={`allFactsTable`} class="hidden sm:flex flex-col mt-14">
			<h1 class="font-bold text-3xl pb-4">All Fact Statements</h1>
			<div class="section-container p-7">
				<FactTable />
			</div>
		</section>
	</div>
</main>
