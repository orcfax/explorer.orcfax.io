<script lang="ts">
	import FeedQuickSwitcher from '$lib/components/FeedQuickSwitcher.svelte';
	import PingStatus from '$lib/components/PingStatus.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';
	import type { DBFeedWithData, FactStatement, Feed, RiskRatings } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { capitalize, getHeartbeatFromInterval } from '$lib/client/helpers';
	import PriceDifferenceBadges from '$lib/components/PriceDifferenceBadges.svelte';
	import FormattedCurrencyValue from '$lib/components/FormattedCurrencyValue.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { feedsListStore } from '$lib/stores/feedsList';
	import RiskRatingBadge from '$lib/components/RiskRatingBadge.svelte';
	import AssetBadge from '$lib/components/AssetBadge.svelte';

	export let feed: Feed;
	export let riskRatings: RiskRatings;
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
		<div class="flex flex-col w-full space-y-6 xs:space-y-10">
			<div class="flex flex-col space-y-4 justify-betwee xs:space-y-0 xs:space-x-4 xs:flex-row">
				<div class="flex flex-col space-y-2">
					<div class="flex items-center space-x-2 -ml-1 sm:ml-0">
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

				<div class="flex flex-col h-max gap-4 w-full relative">
					<div
						class="flex flex-row justify-evenly items-center space-x-4 space-y-0 p-4 bg-card text-card-foreground border-[2px] rounded-lg xs:justify-around xs:rounded-none xs:border-l-[3px] xs:border-b-[3px] xs:rounded-tr-lg xs:rounded-bl-lg xs:max-w-max xs:-mr-[18px] xs:-mt-[18px] xs:absolute xs:top-0 xs:right-0 md:space-x-8"
					>
						<div class="flex flex-col">
							<h3 class="font-bold">Latest Value:</h3>
							<button
								type="button"
								class="text-xl whitespace-nowrap w-min font-bold"
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
						<PriceDifferenceBadges
							{feed}
							class="space-y-2 w-fit self-end md:flex md:space-y-0 md:space-x-2 md:self-center"
						/>
					</div>
				</div>
			</div>

			<div class="flex flex-col xs:flex-row space-y-4 xs:space-y-0 xs:space-x-4 xs:justify-around">
				<div
					class="grid grid-cols-2 gap-x-24 gap-y-4 xs:gap-x-10 xs:gap-y-8 xs:items-center xs:h-fit xs:self-center lg:grid-cols-4"
				>
					<div class="flex flex-col justify-around space-y-1 w-full xs:w-fit">
						<h3 class="font-bold">Type:</h3>
						<Badge variant="outline" class="flex w-max">
							<p class="text-card-foreground text-opacity-70">
								{feed.type_description}
							</p>
						</Badge>
					</div>

					<div class="flex flex-col justify-around space-y-1 w-full xs:w-fit">
						<h3 class="font-bold">Source:</h3>
						<Badge variant="outline" class="flex w-fit">
							<p class="text-card-foreground text-opacity-70">
								{feed.source_type}
							</p>
						</Badge>
					</div>

					<div class="flex flex-col justify-around space-y-1 w-full xs:w-fit">
						<h3 class="font-bold">Schedule:</h3>
						<Badge variant="outline" class="flex w-max">
							<p class="text-card-foreground text-opacity-70">
								{#if feed.status === 'active'}
									{`${heartbeat} or ${deviationPercentage} change`}
								{:else}
									{`No scheduled publications`}
								{/if}
							</p>
						</Badge>
					</div>

					<div class="flex flex-col justify-around space-y-1 w-full xs:w-fit">
						<h3 class="font-bold">Funding:</h3>
						<Badge variant="outline" class="flex w-fit">
							<p class="text-card-foreground text-opacity-70">
								{capitalize(feed.funding_type)}
							</p>
						</Badge>
					</div>
				</div>
				<div class="flex flex-col col-span-2 space-y-2">
					<h3 class="font-bold">Assets:</h3>
					<div
						class="flex space-x-2 justify-around border rounded-lg p-4 xs:flex-col xs:space-x-0 xs:space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
					>
						{#if feed.base_asset}
							<div class="flex flex-col space-y-2 w-fit">
								<h4 class="font-bold text-base">Base:</h4>
								<div class="flex flex-col space-y-2">
									<div class="flex items-center">
										<AssetBadge asset={feed.base_asset} size="md" />
										<h5 class="mx-1 text-sm">{feed.base_asset.ticker}</h5>
										<div class="-mt-3">
											<RiskRatingBadge riskRating={riskRatings.base} size="sm" />
										</div>
									</div>
								</div>
							</div>
						{/if}
						{#if feed.quote_asset}
							<div class="flex flex-col space-y-2 w-fit">
								<h4 class="font-bold text-base">Quote:</h4>
								<div class="flex flex-col space-y-2">
									<div class="flex items-center">
										<AssetBadge asset={feed.quote_asset} size="md" />
										<h5 class="mx-1 text-sm">{feed.quote_asset.ticker}</h5>
										<div class="-mt-3">
											<RiskRatingBadge riskRating={riskRatings.quote} size="sm" />
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
