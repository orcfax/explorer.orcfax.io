<script lang="ts">
	import type { DBFeedWithData, FactStatement, Feed } from '$lib/types';
	import FeedCard from './FeedCard.svelte';
	import * as Select from '$lib/components/ui/select';
	import Input from '$lib/components/ui/input/input.svelte';
	import { formatFeedForDisplay } from '$lib/client/helpers';

	export let feeds: DBFeedWithData[];
	$: formattedFeeds = feeds.map(formatFeedForDisplay);

	let query = '';
	let filteredFeeds: Feed[];
	let sortBy = { value: 'updated', label: 'Last Updated' };
	let sourceType = { value: 'all', label: 'All' };
	let status = { value: 'active', label: 'Active' };

	$: filterAndSortFeeds(formattedFeeds, query, sortBy, sourceType, status);

	async function filterAndSortFeeds(
		formattedFeeds: Feed[],
		query: string,
		sortBy: { value: string; label: string },
		sourceType: { value: string; label: string },
		status: { value: string; label: string }
	) {
		const fuzzySearch = (query: string) => new RegExp(query.replace(/[-/\s]/g, '.*'), 'i');
		const filtered =
			formattedFeeds.filter((feed) => {
				const matchesQuery = fuzzySearch(query).test(feed.feed_id.replace(/[-/\s]/g, ''));
				const matchesSourceType =
					sourceType.value === 'all' || feed.source_type === sourceType.value.toUpperCase();
				const matchesStatus = status.value === 'all' || feed.status === status.value;
				return matchesQuery && matchesSourceType && matchesStatus;
			}) || [];

		const getValidationDate = (fact: FactStatement | null) =>
			fact ? new Date(fact.validation_date).getTime() : new Date(0).getTime();

		const sorted = filtered.sort((a, b) => {
			if (sortBy.value === 'updated') {
				return getValidationDate(b.latestFact) - getValidationDate(a.latestFact);
			} else {
				return a.feed_id.localeCompare(b.feed_id);
			}
		});

		filteredFeeds = sorted;
	}
</script>

<div class="flex flex-col w-full h-full min-h-96 section-container lg:p-14 lg:pt-10">
	<!-- Filter controls -->
	<div class="hidden md:flex w-fit justify-end items-start self-end pb-6 space-x-4">
		<div class="flex flex-col space-y-1 w-max">
			<Input
				type="text"
				name="feedsSearchFilter"
				id="feedsSearchFilter"
				placeholder="Search Feeds..."
				class="max-w-xs md:mr-1.5 w-full"
				bind:value={query}
			/>
			<span class="text-muted-foreground text-xs md:ml-2">
				{`Showing ${filteredFeeds.length} of ${feeds.length}`}
			</span>
		</div>

		<div class="flex flex-col -mt-5">
			<h3 class="text-muted-foreground text-xs mb-1">Sort By:</h3>
			<Select.Root bind:selected={sortBy}>
				<Select.Trigger class="w-[150px]">
					<Select.Value placeholder="Sort By" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="updated">Last Updated</Select.Item>
					<Select.Item value="alpha">Alphabetical</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex flex-col -mt-5">
			<h3 class="text-muted-foreground text-xs mb-1">Status:</h3>
			<Select.Root bind:selected={status}>
				<Select.Trigger class="w-[120px]">
					<Select.Value placeholder="Status" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All</Select.Item>
					<Select.Item value="active">Active</Select.Item>
					<Select.Item value="inactive">Inactive</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex flex-col -mt-5">
			<h3 class="text-muted-foreground text-xs mb-1">Source Type:</h3>
			<Select.Root bind:selected={sourceType}>
				<Select.Trigger class="w-[120px]">
					<Select.Value placeholder="Source Type" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All</Select.Item>
					<Select.Item value="cex">CEX APIs</Select.Item>
					<Select.Item value="dex">DEX LPs</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	{#if filteredFeeds.length > 0}
		<ul class="grid gap-7 lg:gap-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredFeeds as feed (feed.feed_id)}
				<li>
					<FeedCard {feed} />
				</li>
			{/each}
		</ul>
	{:else}
		<div class="flex w-full h-full min-h-full justify-center items-center mt-20">
			<div
				class="text-muted-foreground self-center py-2 px-4 bg-muted rounded-full w-fit h-full text-center"
			>
				No feeds found...
			</div>
		</div>
	{/if}
</div>
