<script lang="ts">
	import { preventDefault, stopPropagation } from 'svelte/legacy';

	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import CopyingIcon from '$lib/icons/CopyingIcon.svelte';


	
	interface Props {
		value: string | number;
		tooltipDirection?: 'tooltip-right' | 'tooltip-left' | 'tooltip-bottom' | 'tooltip-top';
		class?: string;
	}

	let { value, tooltipDirection = 'tooltip-top', class: className = '' }: Props = $props();

	let isCopying = $state(false);
	let showCopiedTooltip = $state(false);

	function handleCopyToClipboard() {
		navigator.clipboard.writeText(value.toString());
		isCopying = true;
		showCopiedTooltip = true;
		setTimeout(() => {
			isCopying = false;
		}, 1000);
		setTimeout(() => {
			showCopiedTooltip = false;
		}, 1500);
		return;
	}
</script>

<button
	class={`group relative flex shrink-0 h-9 w-9 items-center justify-center isolate z-10 ${tooltipDirection} ${className}`}
	class:tooltip={showCopiedTooltip}
	class:tooltip-open={showCopiedTooltip}
	data-tip="Copied!"
	onclick={stopPropagation(preventDefault(handleCopyToClipboard))}
>
	{#if isCopying}
		<CopyingIcon />
	{:else}
		<CopyIcon />
	{/if}
</button>
