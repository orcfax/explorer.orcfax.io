<script lang="ts">
	import type { Feed } from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import FeedNameplate from './FeedNameplate.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';
	import UpRightArrowIcon from '$lib/icons/UpRightArrowIcon.svelte';
	import { Separator } from 'bits-ui';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import PingStatus from './PingStatus.svelte';
	import PriceDifferenceBadges from './PriceDifferenceBadges.svelte';
	import FormattedCurrencyValue from './FormattedCurrencyValue.svelte';
	import { getFeedUrl } from '$lib/client/helpers';

	export let feed: Feed;
	$: timeSinceLastUpdate = createTimeSinceStore(feed.latestFact.validation_date);
</script>

<a href={getFeedUrl(feed)} class="w-max">
	<Card.Root
		class="w-fit min-w-full transition-all duration-700 fill-border hover:scale-[1.01] hover:border-card-foreground hover:fill-card-foreground"
	>
		<Card.Header class="p-5 pb-2">
			<Card.Title class="relative mb-1 space-y-2 md:space-y-0">
				<div class="absolute -top-4 -right-4 xxs:top-0 xxs:right-0">
					<UpRightArrowIcon fillColor="fill-inherit" />
				</div>
				<FeedNameplate {feed} />
			</Card.Title>
			<Card.Description>
				<div class="relative top-0 left-0 flex items-center h-full space-x-2 mb-2">
					<p class="text-sm">
						<span class="font-bold">ID:</span>
						<span class="text-muted-foreground">{feed.feed_id}</span>
					</p>
					<Tooltip.Root openDelay={150}>
						<Tooltip.Trigger>
							<PingStatus color={feed.status === 'active' ? 'green' : 'red'} size="md" />
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>This feed is {feed.status}.</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</Card.Description>
		</Card.Header>
		<hr />
		<Card.Content class="flex justify-around space-x-3 p-4">
			<div class="flex flex-col justify-center">
				<h3 class="font-normal text-lg whitespace-nowrap">Latest Value:</h3>
				<a
					href={getFeedUrl(feed)}
					class="text-lg whitespace-nowrap w-min font-semibold underline hover:text-primary"
				>
					<FormattedCurrencyValue value={feed.latestFact.value} />
				</a>
				<Tooltip.Root openDelay={150}>
					<Tooltip.Trigger>
						<p class="text-start text-xs mt-1 text-card-foreground text-opacity-50">
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
			<Separator.Root
				class="hidden xxxs:inline w-[1px] bg-border"
				orientation="vertical"
				decorative
			/>
			<PriceDifferenceBadges {feed} class="hidden xxxs:flex flex-col space-x-0 space-y-2" />
		</Card.Content>
	</Card.Root>
</a>
