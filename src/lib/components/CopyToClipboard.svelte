<script lang="ts">
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import CopyingIcon from '$lib/icons/CopyingIcon.svelte';

	export let value: string | number;
	export let tooltipDirection: 'tooltip-right' | 'tooltip-left' | 'tooltip-bottom' | 'tooltip-top' =
		'tooltip-top';

	let isCopying = false;
	let showCopiedTooltip = false;

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
	class={`group relative flex -mt-2 shrink-0 h-9 w-9 items-center justify-center isolate z-10 ${tooltipDirection}`}
	class:tooltip={showCopiedTooltip}
	class:tooltip-open={showCopiedTooltip}
	data-tip="Copied!"
	on:click|preventDefault|stopPropagation={handleCopyToClipboard}
>
	{#if isCopying}
		<CopyingIcon />
	{:else}
		<CopyIcon />
	{/if}
</button>
