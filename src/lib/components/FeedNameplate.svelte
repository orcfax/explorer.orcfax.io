<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { DBFeedWithData } from '$lib/types';
	import { getFeedIDWithoutVersion } from '$lib/client/helpers';
	import AssetBadge from './AssetBadge.svelte';
	import { error } from '@sveltejs/kit';

	let labelText = $state('');

	if (!feed.base_asset || !feed.quote_asset)
		error(500, 'FeedNameplate must have base and quote assets');

	interface Props {
		feed: Pick<DBFeedWithData, 'feed_id' | 'name' | 'base_asset' | 'quote_asset'>;
		label?: 'fullID' | 'name' | 'typeAndName';
		size?: 'sm' | 'md' | 'lg';
	}

	let { feed, label = 'name', size = 'lg' }: Props = $props();

	const assetSizes = {
		container: {
			sm: 'w-12 h-8',
			md: 'w-14 h-9',
			lg: 'w-16 h-10'
		},
		overlap: {
			sm: 'left-1',
			md: '-left-1',
			lg: '-left-2'
		}
	};

	run(() => {
		if (label === 'fullID') {
			labelText = feed.feed_id;
		} else if (label === 'name') {
			labelText = feed.name;
		} else if (label === 'typeAndName') {
			labelText = getFeedIDWithoutVersion(feed.feed_id);
		}
	});
	let containerSize = $derived(assetSizes.container[size]);
	let overlap = $derived(assetSizes.overlap[size]);
</script>

{#if feed.base_asset && feed.quote_asset}
	<div class="flex min-[380px]:flex-row flex-col items-center space-x-2 relative">
		<div class={`relative ${containerSize}`}>
			<AssetBadge asset={feed.quote_asset} {size} class={`absolute right-0 top-0`} />
			<AssetBadge asset={feed.base_asset} {size} class={`absolute ${overlap} top-0 z-10`} />
		</div>

		<span class={`ml-4 inline`}>
			{labelText}
		</span>
	</div>
{/if}
