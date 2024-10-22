<script lang="ts">
	import { getXerberusRiskDescription } from '$lib/client/helpers';
	import FactCardField from '$lib/components/FactCardField.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { RiskRating } from '$lib/types';

	type $$Props = {
		riskRating: RiskRating;
		size: 'sm' | 'md' | 'lg';
		class?: string;
	};

	export let riskRating: RiskRating;

	export let size: 'sm' | 'md' | 'lg' = 'lg';

	let className: $$Props['class'] = undefined;
	export { className as class };

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

<div class={`${className}`}>
	{#if riskRating}
		{#await riskRating}
			<Skeleton class={`rounded-full ${assetSize}`} />
		{:then riskRating}
			{#if riskRating}
				<HoverCard.Root openDelay={150}>
					<HoverCard.Trigger
						href={`https://app.xerberus.io/cardano/stats?token=${riskRating.response.data.asset_name}`}
						target="_blank"
						class="cursor-pointer"
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
					</HoverCard.Trigger>
					<HoverCard.Content>
						<div class="space-y-4">
							<FactCardField name="Name" value={riskRating.response.data.asset_name} />
							<FactCardField name="Category" value={riskRating.response.data.risk_category} />
							<FactCardField
								name="Description"
								value={getXerberusRiskDescription(riskRating.response.data.risk_category)}
							/>
							<FactCardField
								name="Endpoint"
								value={riskRating.endpoint}
								allowCopyToClipboard
								ellipsisAndHover
							/>
							<FactCardField name="Signed By" value={riskRating.xSignedBy} />
							<FactCardField
								name="Signature"
								value={riskRating.xSignature}
								allowCopyToClipboard
								ellipsisAndHover
							/>
						</div>
					</HoverCard.Content>
				</HoverCard.Root>
			{/if}
		{/await}
	{/if}
</div>
