<script lang="ts">
	import type { DBFeedWithData } from '$lib/types';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';

	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { getFeedIDWithoutVersion } from '$lib/client/helpers';

	export let feed: Pick<DBFeedWithData, 'feed_id' | 'name' | 'base_asset' | 'quote_asset'>;
	export let label: 'fullID' | 'name' | 'typeAndName' = 'name';
	export let hideNameOnMobile = false;
	let labelText = '';

	$: {
		if (label === 'fullID') {
			labelText = feed.feed_id;
		} else if (label === 'name') {
			labelText = feed.name;
		} else if (label === 'typeAndName') {
			labelText = getFeedIDWithoutVersion(feed.feed_id);
		}
	}

	export let size: 'sm' | 'md' | 'lg' = 'lg';

	const assetSizes = {
		icon: {
			sm: 'w-6 h-6',
			md: 'w-8 h-8',
			lg: 'w-10 h-10'
		},
		fallbackText: {
			sm: 'text-[6px]/[10px]',
			md: 'text-[8px]/[12px]',
			lg: 'text-[11px]/[15px]'
		},
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

	$: assetSize = assetSizes.icon[size];
	$: fallbackTextSize = assetSizes.fallbackText[size];
	$: containerSize = assetSizes.container[size];
	$: overlap = assetSizes.overlap[size];
</script>

<div class="flex items-center space-x-2 relative">
	<div class={`relative ${containerSize}`}>
		<Tooltip.Root openDelay={150}>
			<Tooltip.Trigger asChild let:builder>
				<div use:builder.action {...builder} class="absolute right-0 top-0">
					<Avatar.Root
						class={`border ${assetSize}`}
						style={feed.quote_asset.backgroundColor
							? `background-color: ${feed.quote_asset.backgroundColor}`
							: ''}
					>
						{#if feed.quote_asset.image}
							<Avatar.Image
								src={feed.quote_asset.image}
								alt={`Asset logo of ${feed.quote_asset.name ?? feed.quote_asset.ticker}`}
							/>
							<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
								<div class="relative flex items-center justify-center">
									<Skeleton class={assetSize} />
									<span class="absolute text-card-foreground">{feed.quote_asset.ticker}</span>
								</div>
							</Avatar.Fallback>
						{:else}
							<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
								{feed.quote_asset.ticker}
							</Avatar.Fallback>
						{/if}
					</Avatar.Root>
				</div>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>
					{feed.quote_asset.name ?? feed.quote_asset.ticker}
					{#if feed.quote_asset.url}
						-
						<a href={feed.quote_asset.url} target="_blank" class="underline">
							{feed.quote_asset.url}
						</a>
					{/if}
				</p>
			</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root openDelay={150}>
			<Tooltip.Trigger asChild let:builder>
				<div use:builder.action {...builder} class={`absolute ${overlap} top-0 z-10`}>
					<Avatar.Root
						class={`border ${assetSize}`}
						style={feed.base_asset.backgroundColor
							? `background-color: ${feed.base_asset.backgroundColor}`
							: ''}
					>
						{#if feed.base_asset.image}
							<Avatar.Image
								src={feed.base_asset.image}
								alt={`Asset logo of ${feed.base_asset.name ?? feed.base_asset.ticker}`}
							/>
							<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
								<div class="relative flex items-center justify-center">
									<Skeleton class={assetSize} />
									<span class="absolute text-card-foreground">{feed.base_asset.ticker}</span>
								</div>
							</Avatar.Fallback>
						{:else}
							<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
								{feed.base_asset.ticker}
							</Avatar.Fallback>
						{/if}
					</Avatar.Root>
				</div>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>
					{feed.base_asset.name ?? feed.base_asset.ticker}
					{#if feed.base_asset.url}
						-
						<a href={feed.base_asset.url} target="_blank" class="underline">
							{feed.base_asset.url}
						</a>
					{/if}
				</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>

	<span class={`${hideNameOnMobile ? 'hidden min-[320px]:inline' : 'ml-4 inline'}`}>
		{labelText}
	</span>
</div>
