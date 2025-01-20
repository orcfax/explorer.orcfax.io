<script lang="ts">
	import FeedQuickSwitcher from '$lib/components/FeedQuickSwitcher.svelte';
	import PingStatus from '$lib/components/PingStatus.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';
	import type { DBFeedWithData, FactStatement, Feed, RiskRatings } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import PriceDifferenceBadges from '$lib/components/PriceDifferenceBadges.svelte';
	import FormattedCurrencyValue from '$lib/components/FormattedCurrencyValue.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { feedsListStore } from '$lib/stores/feedsList';
	import { readable } from 'svelte/store';
	import { CircleHelp } from 'lucide-svelte';
	import FeedSummaryFields from './FeedSummaryFields.svelte';

	interface Props {
		feed: Feed;
		riskRatings: RiskRatings;
		onLatestFactClick: (latestFact: FactStatement | null) => void;
		onFeedSwitch: (feed: DBFeedWithData) => void;
	}

	let { feed, riskRatings, onLatestFactClick, onFeedSwitch }: Props = $props();

	let timeSinceLastUpdate = $derived(
		feed.latestFact ? createTimeSinceStore(feed.latestFact.validation_date) : readable('N/A')
	);
</script>

<section
	class="flex items-start md:items-center w-full gap-4 md:gap-7 section-container border-[3px] rounded-b-none p-4 pt-0"
>
	<div class="flex flex-col w-full gap-4">
		<div class="flex justify-between w-full relative gap-3 xs:gap-6">
			<div class="flex flex-col space-y-2 pt-3">
				<div class="flex items-center gap-2">
					<p class="text-xs xxxs:text-sm flex gap-1">
						<span class="font-bold">ID:</span>
						<span class="text-muted-foreground whitespace-nowrap">{feed.feed_id}</span>
					</p>
					<Tooltip.Root openDelay={150}>
						<Tooltip.Trigger class="flex items-center gap-2 self-end mb-1">
							<PingStatus color={feed.status === 'active' ? 'green' : 'red'} size="md" />
							{#if feed.status === 'inactive' && feed.inactive_reason}
								<CircleHelp
									strokeWidth="2.5px"
									class="stroke-primary fill-primary-foreground w-4"
								/>
							{/if}
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>
								{(feed.status === 'inactive' && feed.inactive_reason) ||
									`This feed is ${feed.status}`}
							</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
				{#await $feedsListStore}
					<Skeleton class="h-[3.88rem] w-[11.44rem]" />
				{:then feeds}
					<FeedQuickSwitcher {onFeedSwitch} initialFeedID={feed.feed_id} {feeds} />
				{/await}
			</div>
			<div class="hidden min-[850px]:flex w-full">
				<FeedSummaryFields {feed} {riskRatings} />
			</div>
			<div class="flex flex-col gap-4 relative top-0 right-0">
				<div
					class="flex flex-row sm:w-max self-start sticky top-0 gap-4 bg-card text-card-foreground border-[3px] border-l-[3px] rounded-lg rounded-br-none rounded-tl-none -mt-[3px] -mr-[19px] p-4"
				>
					<div class="flex flex-col justify-center">
						<h3 class="font-bold">Latest Value:</h3>
						<button
							type="button"
							class="text-base sm:text-xl whitespace-nowrap w-min font-bold water-reflection-text water-reflection-underline"
							onclick={() => onLatestFactClick(feed.latestFact)}
						>
							{#if feed.latestFact}
								<FormattedCurrencyValue value={feed.latestFact.value} />
							{:else}
								<p>N/A</p>
							{/if}
						</button>

						<Tooltip.Root openDelay={150}>
							<Tooltip.Trigger>
								<p class="text-xs text-start mt-2 text-card-foreground">
									{$timeSinceLastUpdate}
								</p>
							</Tooltip.Trigger>
							<Tooltip.Content side="bottom">
								<p>
									{feed.latestFact
										? `${feed.latestFact.validation_date_formatted} ${feed.latestFact.validation_time_formatted}`
										: 'N/A'}
								</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</div>

					<PriceDifferenceBadges {feed} class="hidden xs:block space-y-2 self-center" />
				</div>
			</div>
		</div>

		<div class="flex min-[850px]:hidden">
			<FeedSummaryFields {feed} {riskRatings} />
		</div>
	</div>
</section>
