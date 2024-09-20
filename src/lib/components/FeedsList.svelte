<script lang="ts">
	import FeedCard from './FeedCard.svelte';
	import * as Select from '$lib/components/ui/select';
	import Input from '$lib/components/ui/input/input.svelte';
	// import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { Feed } from '$lib/types';

	export let feeds: Feed[];

	let query = '';
	const fuzzySearch = (query: string) => new RegExp(query.replace(/[-/\s]/g, '.*'), 'i');

	$: sortFilter = { value: 'updated', label: 'Last Updated' };

	$: filteredFeeds = (
		feeds.filter((feed) => fuzzySearch(query).test(feed.feed_id.replace(/[-/\s]/g, ''))) || []
	).sort((a, b) => {
		if (sortFilter.value === 'updated') {
			return (
				new Date(b.latestFact.validation_date).getTime() -
				new Date(a.latestFact.validation_date).getTime()
			);
		} else {
			return a.feed_id.localeCompare(b.feed_id);
		}
	});
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
		<Select.Root bind:selected={sortFilter}>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Sort By" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="updated">Last Updated</Select.Item>
				<Select.Item value="alpha">Alphabetical</Select.Item>
			</Select.Content>
		</Select.Root>
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
<!-- Loading Skeleton -->
<!-- <div class="flex w-full justify-end mb-3 space-x-4">
		<div class="flex flex-col space-y-1">
			<Skeleton class="h-8 w-48" />
			<Skeleton class="h-4 w-32" />
		</div>
		<Skeleton class="h-8 w-32" />
	</div>
	<div class="flex flex-col w-full h-full min-h-96 p-6 border rounded-lg">
		<ul class="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<li class="relative h-60 w-80">
					<Skeleton class="h-full w-full border bg-transparent absolute top-0 left-0" />
					<div class="flex flex-col w-full h-full absolute top-0 left-0 p-6">
						<div class="flex items-center space-x-2">
							<div class="flex relative -space-x-2">
								<Skeleton class="rounded-full h-11 w-11" />
								<Skeleton class="rounded-full h-11 w-11" />
							</div>

							<Skeleton class="h-4 w-24" />
						</div>
						<Skeleton class="h-3 w-32 mt-2" />
						<Skeleton class="h-7 w-28 mt-6" />
						<Skeleton class="h-3 w-48 mt-4" />
						<div class="flex w-full justify-center space-x-4 mt-auto">
							<Skeleton class="h-6 w-16 rounded-full" />
							<Skeleton class="h-6 w-16 rounded-full" />
							<Skeleton class="h-6 w-16 rounded-full" />
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div> -->
