<script lang="ts">
	import type { Feed, RiskRatings } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import AssetBadge from '$lib/components/AssetBadge.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import RiskRatingBadge from '$lib/components/RiskRatingBadge.svelte';
	import { capitalize, getHeartbeatFromInterval } from '$lib/client/helpers';
	import PriceDifferenceBadges from '$lib/components/PriceDifferenceBadges.svelte';

	export let feed: Feed;
	export let riskRatings: RiskRatings;

	$: deviationPercentage = feed.deviation + '%';
	$: heartbeat = getHeartbeatFromInterval(feed.heartbeat_interval);
</script>

<!-- Large screen view -->
<div class="hidden flex-wrap w-full gap-4 space-y-2 py-4">
	<div class="flex flex-col justify-around space-y-1 w-fit">
		<h3 class="font-bold">Type:</h3>
		<Badge variant="outline" class="flex w-max">
			<p class="text-card-foreground text-opacity-70">
				{feed.type_description}
			</p>
		</Badge>
	</div>

	<div class="flex flex-col justify-around space-y-1 w-fit">
		<h3 class="font-bold">Source:</h3>
		<Badge variant="outline" class="flex w-fit">
			<p class="text-card-foreground text-opacity-70">
				{feed.source_type}
			</p>
		</Badge>
	</div>

	<div class="flex flex-col justify-around space-y-1 w-fit">
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

	<div class="flex flex-col justify-around space-y-1 w-fit">
		<h3 class="font-bold">Funding:</h3>
		<Badge variant="outline" class="flex w-fit">
			<p class="text-card-foreground text-opacity-70">
				{capitalize(feed.funding_type)}
			</p>
		</Badge>
	</div>

	<div class="flex gap-6">
		{#if feed.base_asset}
			<div class="flex flex-col space-y-2 w-fit">
				<h4 class="font-bold">Base Asset:</h4>
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
				<h4 class="font-bold">Quote Asset:</h4>
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

<!-- Mobile view -->
<Accordion.Root class="block w-full rounded-lg px-4 m-4 mt-8 border h-fit" value="feedDetails">
	<Accordion.Item value="feedDetails" class="border-none">
		<Accordion.Trigger class="font-bold w-full">Feed Details</Accordion.Trigger>
		<Accordion.Content>
			<div class="flex flex-row flex-wrap gap-6">
				<div class="flex flex-col xs:hidden justify-around space-y-2 w-full">
					<h3 class="font-bold">Price Change:</h3>
					<PriceDifferenceBadges {feed} class="space-y-2 w-fit" />
				</div>
				<div class="flex flex-col space-y-2 w-fit">
					<h3 class="font-bold">Type:</h3>
					<Badge variant="outline" class="flex w-max">
						<p class="hidden min-[390px]:hidden text-card-foreground text-opacity-70">
							{feed.type_description_short}
						</p>
						<p class=" text-card-foreground text-opacity-70">
							{feed.type_description}
						</p>
					</Badge>
				</div>

				<div class="flex flex-col space-y-2 w-fit">
					<h3 class="font-bold">Source:</h3>
					<Badge variant="outline" class="flex w-fit">
						<p class="text-card-foreground text-opacity-70">
							{feed.source_type}
						</p>
					</Badge>
				</div>

				<div class="flex flex-col space-y-2 w-fit">
					<h3 class="font-bold">Schedule:</h3>
					<Badge variant="outline" class="flex w-max">
						<p class="text-card-foreground text-opacity-70">
							{#if feed.status === 'active'}
								{`${heartbeat} or ${deviationPercentage}`}
							{:else}
								{`No scheduled publications`}
							{/if}
						</p>
					</Badge>
				</div>

				<div class="flex flex-col space-y-2 w-fit">
					<h3 class="font-bold">Funding:</h3>
					<Badge variant="outline" class="flex w-fit">
						<p class="text-card-foreground text-opacity-70">
							{capitalize(feed.funding_type)}
						</p>
					</Badge>
				</div>

				<div class="flex flex-wrap gap-6">
					{#if feed.base_asset}
						<div class="flex flex-col space-y-2 w-fit">
							<h4 class="font-bold">Base Asset:</h4>
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
							<h4 class="font-bold">Quote Asset:</h4>
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
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
