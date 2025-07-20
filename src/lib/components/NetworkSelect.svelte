<script lang="ts">
	import { capitalize, getNetworkUrl } from '$lib/client/helpers';
	import * as Select from '$lib/components/ui/select';
	import { networkStore } from '$lib/stores/network';
	import { NetworkSelectSchema, type NetworkSelect } from '$lib/types';
	import Loading from '$lib/components/Loading.svelte';
	import { page } from '$app/stores';

	type $$Props = {
		class?: string;
	};
	let className: $$Props['class'] = undefined;
	export { className as class };

	$: selectedNetwork = getSelectedNetwork($networkStore.network.name);

	let isSwitchingNetworks = false;

	function getSelectedNetwork(networkName: string): NetworkSelect {
		return {
			value: networkName,
			label: capitalize(networkName),
			color: networkName === 'Mainnet' ? 'border-l-green-400' : 'border-l-yellow-400'
		};
	}

	async function switchNetwork(value: unknown | undefined) {
		isSwitchingNetworks = true;
		const selection = NetworkSelectSchema.safeParse(value);
		if (selection.success) {
			selectedNetwork = getSelectedNetwork(selection.data.value);

			const newUrl = getNetworkUrl($page.url.origin, selection.data.value);

			// Nav to the new url
			window.location.href = newUrl;

			isSwitchingNetworks = false; //TODO this is not working
		}
	}
</script>

{#if isSwitchingNetworks}
	<div
		class="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-80 z-50"
	>
		<Loading />
	</div>
{/if}

<div class={className}>
	<Select.Root selected={selectedNetwork} onSelectedChange={switchNetwork}>
		<Select.Trigger
			class={`select select-bordered w-32 max-w-xs border-l-8 ${selectedNetwork.color}`}
		>
			<Select.Value />
		</Select.Trigger>
		<Select.Content>
			{#each $networkStore.networks as network}
				<Select.Item disabled={!network.is_enabled} value={network.name}>
					{network.name}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
