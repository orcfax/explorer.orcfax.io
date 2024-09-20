<script lang="ts">
	import type { FactStatement } from '$lib/types';
	import ArweaveLogo from '$lib/icons/ArweaveLogo.svelte';
	import CardanoLogo from '$lib/icons/CardanoLogo.svelte';

	export let fact: FactStatement;
	export let offsetTooltip = false;
</script>

<div class={`relative top-0 left-0 flex justify-between w-full items-end ${$$props.class}`}>
	<div class="flex space-x-2 bg-primary shadow border border-l-0 p-2 rounded-r-lg">
		{#if fact.transaction_id}
			<div
				class="tooltip"
				class:tooltip-right={offsetTooltip}
				data-tip="This Fact was published to Cardano"
			>
				<CardanoLogo fillColor={'fill-primary-foreground'} />
			</div>
		{/if}
		{#if fact.storage_urn && fact.id !== '4e97b11a-2e17-41fd-a2ca-4f7aad636403'}
			<div
				class="tooltip"
				class:tooltip-right={offsetTooltip}
				data-tip="This Fact was stored on Arweave"
			>
				<ArweaveLogo
					fillColor={'fill-primary-foreground'}
					strokeColor={'stroke-primary-foreground'}
				/>
			</div>
		{/if}
	</div>
</div>
