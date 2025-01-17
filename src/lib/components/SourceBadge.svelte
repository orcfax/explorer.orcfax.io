<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import type { Source } from '$lib/types';


	interface Props {
		source: Source;
		hideTooltip?: boolean;
		isPlainLogo?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		source,
		hideTooltip = false,
		isPlainLogo = false,
		size = 'lg'
	}: Props = $props();

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

	let assetSize = $derived(assetSizes.icon[size]);
	let fallbackTextSize = $derived(assetSizes.fallbackText[size]);
</script>

{#if hideTooltip}
	<Avatar.Root
		class={`${isPlainLogo ? 'border-none' : 'border'} ${assetSize}`}
		style={source.background_color ? `background-color: ${source.background_color}` : ''}
	>
		{#if source.image_path}
			<Avatar.Image src={source.image_path} alt={`Asset logo of ${source.name}`} />
			<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
				<div class="relative flex items-center justify-center">
					<Skeleton class={assetSize} />
					<span class="absolute text-card-foreground">{source.name.slice(0, 2)}</span>
				</div>
			</Avatar.Fallback>
		{:else}
			<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
				{source.name.slice(0, 2)}
			</Avatar.Fallback>
		{/if}
	</Avatar.Root>
{:else}
	<Tooltip.Root openDelay={150} disableHoverableContent={hideTooltip}>
		<Tooltip.Trigger asChild >
			{#snippet children({ builder })}
						<div use:builder.action {...builder}>
					<Avatar.Root
						class={`border ${assetSize}`}
						style={source.background_color ? `background-color: ${source.background_color}` : ''}
					>
						{#if source.image_path}
							<Avatar.Image src={source.image_path} alt={`Asset logo of ${source.name}`} />
							<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
								<div class="relative flex items-center justify-center">
									<Skeleton class={assetSize} />
									<span class="absolute text-card-foreground">{source.name.slice(0, 2)}</span>
								</div>
							</Avatar.Fallback>
						{:else}
							<Avatar.Fallback class={`${fallbackTextSize} text-card-foreground`}>
								{source.name.slice(0, 2)}
							</Avatar.Fallback>
						{/if}
					</Avatar.Root>
				</div>
								{/snippet}
				</Tooltip.Trigger>
		<Tooltip.Content>
			<p>
				{source.name}
				{#if source.website}
					-
					<a href={source.website} target="_blank" class="underline">
						{source.website}
					</a>
				{/if}
			</p>
		</Tooltip.Content>
	</Tooltip.Root>
{/if}
