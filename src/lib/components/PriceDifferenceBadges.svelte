<script lang="ts">
	import type { Feed } from '$lib/types';
	import UpIcon from '$lib/icons/UpIcon.svelte';
	import DownIcon from '$lib/icons/DownIcon.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import UnchangedIcon from '$lib/icons/UnchangedIcon.svelte';
	import { calculatePriceDifference } from '$lib/client/helpers';

	export let feed: Feed;
	export { className as class };

	let className: string | undefined | null;

	$: priceDifferences = {
		'1D': feed.latestFact ? calculatePriceDifference(feed.latestFact.value, feed.oneDayAgo) : 0,
		'3D': feed.latestFact ? calculatePriceDifference(feed.latestFact.value, feed.threeDaysAgo) : 0,
		'7D': feed.latestFact ? calculatePriceDifference(feed.latestFact.value, feed.sevenDaysAgo) : 0
	};

	function getIcon(difference: number) {
		if (difference > 0) return UpIcon;
		if (difference < 0) return DownIcon;
		return UnchangedIcon;
	}

	function getColor(difference: number) {
		if (difference > 0) return 'text-green-600 dark:text-green-500';
		if (difference < 0) return 'text-red-600 dark:text-red-500';
		return 'text-gray-600 dark:text-gray-500';
	}
</script>

<div class={`${className}`}>
	{#each Object.entries(priceDifferences) as [period, difference]}
		<Badge variant="outline" class="flex">
			<span class={`text-xs whitespace-nowrap text-card-foreground text-opacity-60`}>
				{period}
			</span>
			<svelte:component this={getIcon(difference)} />
			<span class={`text-[10px] whitespace-nowrap ${getColor(difference)}`}>
				{difference === 0 ? 'N/A' : `${difference.toFixed(2)}%`}
			</span>
		</Badge>
	{/each}
</div>
