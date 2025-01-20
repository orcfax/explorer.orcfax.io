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

	interface Props {
		initialFeedID?: string;
		feeds: DBFeedWithData[];
		onFeedSwitch: (feed: DBFeedWithData) => void;
	}

	let { initialFeedID = '', feeds, onFeedSwitch }: Props = $props();

	let isSwitchingFeeds = $state(false);
	let open = $state(false);
	let value = $state(initialFeedID);

	let feedOptions = $derived(
		feeds.map(({ name, feed_id, base_asset, quote_asset }) => ({
			label: name,
			value: feed_id,
			base_asset,
			quote_asset
		}))
	);

	let selectedFeed = $derived(feedOptions.find((f) => f.value === value));

	// TODO: fix this 
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

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="w-min min-[370px]:w-full xxxs:w-fit h-fit p-3"
				{...props}
			>
				{#if selectedFeed}
					<FeedNameplate
						feed={{
							feed_id: selectedFeed.value,
							name: selectedFeed.label,
							base_asset: selectedFeed.base_asset,
							quote_asset: selectedFeed.quote_asset
						}}
						size="md"
					/>
				{:else}
					<span class="text-muted-foreground">Switch feeds...</span>
				{/if}

				<ChevronsUpDown class="ml-2 h-4 w-4 md:h-4 md:w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0 h-full max-h-72">
		<Command.Root>
			<Command.Input placeholder="Switch feeds..." />
			<Command.Empty>No feed found.</Command.Empty>
			<Command.Group class="overflow-scroll h-full">
				{#each feedOptions as option}
					<Command.Item
						value={option.value}
						onSelect={async () => {
							isSwitchingFeeds = true;
							const params = new URLSearchParams($page.url.searchParams);
							// value = currentValue;
							// closeAndFocusTrigger(ids.trigger);
							const currentFeed = feeds.find((f) => f.feed_id === value);
							if (!currentFeed) return;
							await goto(
								`${getFeedUrl(currentFeed, currentFeed.latestFact ? currentFeed.latestFact.fact_urn : 'undefined')}?${params.toString()}`
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
								base_asset: option.base_asset,
								quote_asset: option.quote_asset
							}}
							size="sm"
						/>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
