<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { Asset } from '$lib/types';

	type $$Props = {
		asset: Asset;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	};

	export let asset: Asset;
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
		}
	};

	$: assetSize = assetSizes.icon[size];
	$: fallbackTextSize = assetSizes.fallbackText[size];
</script>

<Tooltip.Root openDelay={150}>
	<Tooltip.Trigger asChild let:builder>
		<div use:builder.action {...builder} class={className}>
			<Avatar.Root
				class={`border ${assetSize}`}
				style={asset.background_color ? `background-color: ${asset.background_color}` : ''}
			>
				{#if asset.image_path}
					<Avatar.Image src={asset.image_path} alt={`Asset logo of ${asset.name}`} />
					<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
						<div class="relative flex items-center justify-center">
							<Skeleton class={assetSize} />
							<span class="absolute text-card-foreground">{asset.ticker}</span>
						</div>
					</Avatar.Fallback>
				{:else}
					<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
						{asset.ticker}
					</Avatar.Fallback>
				{/if}
			</Avatar.Root>
		</div>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<p>
			{asset.name || asset.ticker}
			{#if asset.website}
				-
				<a href={asset.website} target="_blank" class="underline">
					{asset.website}
				</a>
			{/if}
		</p>
	</Tooltip.Content>
</Tooltip.Root>
