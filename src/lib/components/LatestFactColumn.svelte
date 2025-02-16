<script lang="ts">
	import { getFormattedDate, getFormattedTime } from '$lib/client/helpers';
	import FactCardField from '$lib/components/FactCardField.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';
	import type { DBFactStatement } from '$lib/types';
	import { readable } from 'svelte/store';

	export let latestFact: DBFactStatement | null;

	$: timeSinceLastUpdate = latestFact
		? createTimeSinceStore(latestFact.validation_date)
		: readable('N/A');
</script>

{#if latestFact}
	<div class="flex flex-col">
		<p class="hidden sm:block text-xs">
			{`${getFormattedDate(latestFact.validation_date)} ${getFormattedTime(latestFact.validation_date)}`}
		</p>
		<p class="text-xs text-muted-foreground">{$timeSinceLastUpdate}</p>
	</div>
{:else}
	<FactCardField name="" value="N/A" />
{/if}
