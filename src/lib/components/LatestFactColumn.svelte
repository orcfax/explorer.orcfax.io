<script lang="ts">
	import { getFormattedDate, getFormattedTime } from '$lib/client/helpers';
	import FactCardField from '$lib/components/FactCardField.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';
	import type { DBFactStatement } from '$lib/types';
	import { readable } from 'svelte/store';

	interface Props {
		latestFact: DBFactStatement | null;
	}

	let { latestFact }: Props = $props();

	let timeSinceLastUpdate = $derived(
		latestFact ? createTimeSinceStore(latestFact.validation_date) : readable('N/A')
	);
</script>

{#if latestFact}
	<FactCardField
		name=""
		value={`${getFormattedDate(latestFact.validation_date)} ${getFormattedTime(latestFact.validation_date)}`}
		accessory={$timeSinceLastUpdate}
	/>
{:else}
	<FactCardField name="" value="N/A" />
{/if}
