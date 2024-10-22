<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { capitalize, getHeartbeatFromInterval } from '$lib/client/helpers';
	import AssetBadge from '$lib/components/AssetBadge.svelte';
	import RiskRatingBadge from '$lib/components/RiskRatingBadge.svelte';
	import type { Feed, RiskRatings } from '$lib/types';

	$: deviationPercentage = feed.deviation + '%';
	$: heartbeat = getHeartbeatFromInterval(feed.heartbeat_interval);

	export let feed: Feed;
	export let riskRatings: RiskRatings;
</script>

<div class="flex flex-wrap w-full gap-8 space-y-2">
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

	{#if feed.base_asset}
		<div class="flex flex-col space-y-2 w-fit">
			<h4 class="font-bold text-base">Base<span class="hidden sm:inline">&nbsp;Asset</span>:</h4>
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
			<h4 class="font-bold text-base">Quote<span class="hidden sm:inline">&nbsp;Asset</span>:</h4>
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
