<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import FeedNameplate from './FeedNameplate.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { DBFeedWithData } from '$lib/types';
	import { getFeedUrl } from '$lib/client/helpers';
	import Loading from '$lib/components/Loading.svelte';

	export let initialFeedID = '';
	export let feeds: DBFeedWithData[];
	export let onFeedSwitch: (feed: DBFeedWithData) => void;

	let isSwitchingFeeds = false;
	let open = false;
	$: value = initialFeedID;

	$: feedOptions = feeds.map((f) => ({
		label: f.name,
		value: f.feed_id,
		baseAsset: f.base_asset,
		quoteAsset: f.quote_asset
	}));

	$: selectedFeed = feedOptions.find((f) => f.value === value);

	// Refocus the trigger button when the user selects an item from the list
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

{#if isSwitchingFeeds}
	<div
		class="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-80 z-50"
	>
		<Loading />
	</div>
{/if}

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-max h-fit p-3 -ml-2 xxxs:ml-0"
		>
			{#if selectedFeed}
				<FeedNameplate
					feed={{
						feed_id: selectedFeed.value,
						name: selectedFeed.label,
						base_asset: selectedFeed.baseAsset,
						quote_asset: selectedFeed.quoteAsset
					}}
					size="md"
					hideNameOnMobile
				/>
			{:else}
				<span class="text-muted-foreground">Switch feeds...</span>
			{/if}

			<ChevronsUpDown class="ml-2 h-4 w-4 md:h-4 md:w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0 h-full max-h-72">
		<Command.Root>
			<Command.Input placeholder="Switch feeds..." />
			<Command.Empty>No feed found.</Command.Empty>
			<Command.Group class="overflow-scroll h-full">
				{#each feedOptions as option}
					<Command.Item
						value={option.value}
						onSelect={async (currentValue) => {
							isSwitchingFeeds = true;
							const params = new URLSearchParams($page.url.searchParams);
							value = currentValue;
							closeAndFocusTrigger(ids.trigger);
							const currentFeed = feeds.find((f) => f.feed_id === currentValue);
							if (!currentFeed) return;
							await goto(
								`${getFeedUrl(currentFeed, currentFeed.latestFact.fact_urn)}?${params.toString()}`
							);
							onFeedSwitch(currentFeed);
							isSwitchingFeeds = false;
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', value !== option.value && 'text-transparent')} />
						<FeedNameplate
							feed={{
								feed_id: option.value,
								name: option.label,
								base_asset: option.baseAsset,
								quote_asset: option.quoteAsset
							}}
							size="sm"
						/>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
