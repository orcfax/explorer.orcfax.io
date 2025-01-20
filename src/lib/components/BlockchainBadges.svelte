<script lang="ts">
	import type { FactStatement } from '$lib/types';
	import ArweaveLogo from '$lib/icons/ArweaveLogo.svelte';
	import CardanoLogo from '$lib/icons/CardanoLogo.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	interface Props {
		fact: FactStatement;
		[key: string]: any;
	}

	let { ...props }: Props = $props();
</script>

<div class={`relative top-0 left-0 flex justify-between w-full items-end ${props.class}`}>
	<div
		class="flex space-x-2 bg-primary shadow border border-primary/20 border-l-0 p-2 rounded-r-lg"
	>
		{#if props.fact.transaction_id}
			<Tooltip.Root openDelay={150}>
				<Tooltip.Trigger>
					<CardanoLogo fillColor={'fill-primary-foreground'} />
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>This Fact was published to Cardano</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
		{#if props.fact.storage_urn && props.fact.id !== '4e97b11a-2e17-41fd-a2ca-4f7aad636403'}
			<Tooltip.Root openDelay={150}>
				<Tooltip.Trigger>
					<ArweaveLogo
						fillColor={'fill-primary-foreground'}
						strokeColor={'stroke-primary-foreground'}
					/>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>This Fact was stored on Arweave</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</div>
</div>
