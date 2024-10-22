<script lang="ts">
	import FeedQuickSwitcher from '$lib/components/FeedQuickSwitcher.svelte';
	import PingStatus from '$lib/components/PingStatus.svelte';
	import type { DBFeedWithData, FactStatement, Feed, RiskRatings } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { feedsListStore } from '$lib/stores/feedsList';
	import FeedSummaryFields from './FeedSummaryFields.svelte';
	import LatestFeedPrice from './LatestFeedPrice.svelte';

	export let feed: Feed;
	export let riskRatings: RiskRatings;
	export let onFeedSwitch: (feed: DBFeedWithData) => void;
	export let onLatestFactClick: (latestFact: FactStatement) => void;
</script>

<section
	class="flex items-start md:items-center w-full gap-4 md:gap-7 section-container border-[3px] rounded-b-none p-4"
>
	<div class="flex justify-between w-full">
		<div class="flex flex-col w-full space-y-6 xs:space-y-10">
			<div class="flex flex-col space-y-4 justify-between xs:space-y-0 xs:space-x-4 xs:flex-row">
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
						<FeedQuickSwitcher {onFeedSwitch} initialFeedID={feed.feed_id} {feeds} {riskRatings} />
					{/await}
				</div>

				<LatestFeedPrice {feed} {onLatestFactClick} />
			</div>

			<div
				class="flex flex-col xs:flex-row space-y-4 xs:space-y-0 xs:space-x-4 xs:justify-around lg:justify-start"
			>
				<FeedSummaryFields {feed} {riskRatings} />
			</div>
		</div>
	</div>
</section>
