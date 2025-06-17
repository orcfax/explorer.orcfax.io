<script lang="ts">
	import type { DBFeedWithData } from '$lib/types';
	import { getFeedIDWithoutVersion } from '$lib/client/helpers';
	import AssetBadge from './AssetBadge.svelte';
	import { error } from '@sveltejs/kit';

	interface Props {
		feed: Pick<DBFeedWithData, 'feed_id' | 'name' | 'base_asset' | 'quote_asset'>;
		label?: 'fullID' | 'name' | 'typeAndName';
		size?: 'sm' | 'md' | 'lg';
		class_name?: string;
	}

	let { feed, label = 'name', size = 'lg', class_name = '' }: Props = $props();

	if (!feed.base_asset || !feed.quote_asset)
		error(500, 'FeedNameplate must have base and quote assets');

	let labelText = $derived.by(() => {
		if (label === 'fullID') {
			return feed.feed_id;
		} else if (label === 'name') {
			return feed.name;
		} else if (label === 'typeAndName') {
			return getFeedIDWithoutVersion(feed.feed_id);
		}
	});

	const assetSizes = {
		container: {
			sm: 'w-12 h-8',
			md: 'w-14 h-9',
			lg: 'w-16 h-10'
		},
		overlap: {
			sm: 'left-1',
			md: '-left-[0.15rem]',
			lg: '-left-2'
		},
		label: {
			sm: 'text-xs',
			md: 'text-sm',
			lg: 'text-base'
		},
		labelMargin: {
			sm: '-mt-2',
			md: '-mt-1',
			lg: '-mt-2'
		}
	};

	let containerSize = $derived(assetSizes.container[size]);
	let overlap = $derived(assetSizes.overlap[size]);
</script>

{#if feed.base_asset && feed.quote_asset}
	<div class={`flex items-center space-x-2 relative ${class_name}`}>
		<div class={`relative ${containerSize}`}>
			<AssetBadge asset={feed.quote_asset} {size} class={`absolute right-0 top-0`} />
			<AssetBadge asset={feed.base_asset} {size} class={`absolute ${overlap} top-0 z-10`} />
		</div>

		<span
			class={`${assetSizes.label[size]} ${assetSizes.labelMargin[size]} ml-4 inline whitespace-nowrap`}
		>
			{labelText}
		</span>
	</div>
{/if}
