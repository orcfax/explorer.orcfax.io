<script lang="ts">
	import { Separator } from 'bits-ui';
	import FeedQuickSwitcher from '$lib/components/FeedQuickSwitcher.svelte';
	import PingStatus from '$lib/components/PingStatus.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';
	import type { DBFeedWithData, FactStatement, Feed } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { capitalize, getHeartbeatFromInterval } from '$lib/client/helpers';
	import PriceDifferenceBadges from '$lib/components/PriceDifferenceBadges.svelte';
	import FormattedCurrencyValue from '$lib/components/FormattedCurrencyValue.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { feedsListStore } from '$lib/stores/feedsList';

	export let feed: Feed;
	export let onLatestFactClick: (latestFact: FactStatement) => void;
	export let onFeedSwitch: (feed: DBFeedWithData) => void;

	$: deviationPercentage = feed.deviation + '%';
	$: heartbeat = getHeartbeatFromInterval(feed.heartbeat_interval);
	$: timeSinceLastUpdate = createTimeSinceStore(feed.latestFact.validation_date);
</script>

<section
	class="flex items-start md:items-center w-full gap-4 md:gap-7 section-container border-[3px] rounded-b-none p-4"
>
	<div class="flex justify-between w-full">
		<div class="flex flex-col sm:flex-row md:items-center">
			<div class="flex flex-col space-y-2">
				<div class="flex items-center h-full space-x-2 -ml-1 sm:ml-0">
					<p class="text-sm flex space-x-1">
						<span class="font-bold">ID:</span>
						<span class="text-muted-foreground">{feed.feed_id}</span>
					</p>
					<Tooltip.Root openDelay={150}>
						<Tooltip.Trigger class="self-end mb-1.5 xxxs:self-auto xxxs:mb-0">
							<PingStatus color={feed.status === 'active' ? 'green' : 'red'} size="md" />
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>This feed is {feed.status}.</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
				{#await $feedsListStore}
					<Skeleton class="h-[3.88rem] w-[11.44rem]" />
				{:then feeds}
					<FeedQuickSwitcher {onFeedSwitch} initialFeedID={feed.feed_id} {feeds} />
				{/await}
			</div>
			<div class="flex flex-col md:flex-row mt-3 sm:mt-6 sm:ml-4">
				<div class="hidden md:flex flex-col space-y-1">
					<h3 class="hidden md:block font-bold">Type:</h3>
					<Badge variant="outline" class="flex w-fit">
						<p class="text-card-foreground text-opacity-70">
							<span class="inline xl:hidden">{feed.type}</span>
							<span class="hidden xl:inline">{feed.type_description}</span>
						</p>
					</Badge>
				</div>
				<Separator.Root
					class="hidden md:block mx-4 w-[1px] bg-border"
					orientation="vertical"
					decorative
				/>
				<div class="flex flex-col space-y-1">
					<h3 class="hidden sm:block font-bold">Schedule:</h3>
					<Badge variant="outline" class="flex w-fit">
						<p class="text-card-foreground text-opacity-70">
							{#if feed.status === 'active'}
								{`${heartbeat} or ${deviationPercentage} change`}
							{:else}
								{`No scheduled publications`}
							{/if}
						</p>
					</Badge>
				</div>
				<Separator.Root
					class="hidden lg:block mx-4 w-[1px] bg-border"
					orientation="vertical"
					decorative
				/>
				<div class="hidden lg:flex flex-col space-y-1">
					<h3 class="hidden md:block font-bold">Source:</h3>
					<Badge variant="outline" class="flex w-fit">
						<p class="text-card-foreground text-opacity-70">
							{feed.source_type}
						</p>
					</Badge>
				</div>
				<Separator.Root
					class="hidden lg:block mx-4 w-[1px] bg-border"
					orientation="vertical"
					decorative
				/>
				<div class="hidden lg:flex flex-col space-y-1">
					<h3 class="hidden md:block font-bold">Funding:</h3>
					<Badge variant="outline" class="flex w-fit">
						<p class="text-card-foreground text-opacity-70">
							{capitalize(feed.funding_type)}
						</p>
					</Badge>
				</div>
			</div>
		</div>

		<div class="flex gap-4">
			<PriceDifferenceBadges {feed} class="hidden xs:block space-y-2" />

			<div
				class="flex flex-col justify-center bg-card text-card-foreground border-[2px] border-l-[3px] rounded-tr-lg -mt-[18px] -mb-[18px] -mr-[18px] p-3 sm:p-6"
			>
				<h3 class="font-bold">Latest Value:</h3>
				<button
					type="button"
					class="text-base sm:text-xl whitespace-nowrap w-min font-bold"
					on:click={() => onLatestFactClick(feed.latestFact)}
				>
					<FormattedCurrencyValue
						value={feed.latestFact.value}
						class="water-reflection-text water-reflection-underline"
					/>
				</button>

				<Tooltip.Root openDelay={150}>
					<Tooltip.Trigger>
						<p class="text-xs text-start mt-2 text-card-foreground">
							{$timeSinceLastUpdate}
						</p>
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom">
						<p>
							{`${feed.latestFact.validation_date_formatted} ${feed.latestFact.validation_time_formatted}`}
						</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
		</div>
	</div>
</section>
