<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { RiskRating } from '$lib/types';

	export let riskRating: RiskRating;

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
</script>

{#if riskRating}
	{#await riskRating}
		<Skeleton class="rounded-full h-11 w-11" />
	{:then riskRating}
		{#if riskRating}
			<Tooltip.Root openDelay={150}>
				<Tooltip.Trigger asChild let:builder>
					<a
						href={`https://app.xerberus.io/cardano/stats?token=${riskRating.response.data.asset_name}`}
						target="_blank"
						class="cursor-pointer"
						use:builder.action
						{...builder}
					>
						<Avatar.Root class={`${assetSize}`}>
							<Avatar.Image
								src={`/xerberus-risk-ratings/${riskRating.response.data.risk_category}.svg`}
								alt={`Logo of Xerberus Risk Rating ${riskRating.response.data.risk_category}`}
							/>
							<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
								<div class="relative flex items-center justify-center">
									<Skeleton class={assetSize} />
									<span class="absolute text-card-foreground">
										{riskRating.response.data.risk_category}
									</span>
								</div>
							</Avatar.Fallback>
						</Avatar.Root>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>
						{riskRating.response.data.asset_name}
					</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	{/await}
{/if}
