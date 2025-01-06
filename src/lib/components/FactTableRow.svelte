<script lang="ts">
	import { goto } from '$app/navigation';
	import type { FactStatement, Feed } from '$lib/types';
	import { ellipsis } from '$lib/client/helpers';
	import OpenFolder from '$lib/icons/OpenFolder.svelte';
	import CopyToClipboard from './CopyToClipboard.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';
	import { error } from '@sveltejs/kit';

	interface Props {
		fact: FactStatement & { feed: Feed };
	}

	let { fact }: Props = $props();

	if (typeof fact.feed === 'string') error(400, 'Full feed required to display Fact Table Row');

	let timeSinceValidated = $derived(createTimeSinceStore(fact.validation_date));
</script>

<tr class="cursor-pointer" onclick={() => goto(`/${fact.id}`)}>
	<td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-700 font-semibold sm:pl-6">
		<div class="flex items-center">
			<p class="tooltip tooltip-right" data-tip={fact.id}>
				{ellipsis(fact.id)}
			</p>
			<CopyToClipboard value={fact.id} />
		</div>
	</td>
	<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-semibold flex flex-col">
		<span>{fact.feed.name}</span>
		<span class="text-gray-500">{fact.feed.type}</span>
	</td>
	<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-semibold">
		{fact.value}
	</td>
	<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-semibold flex flex-col">
		{`${fact.validation_date_formatted} ${fact.validation_time_formatted}`}
		<span class="text-gray-500">{$timeSinceValidated}</span>
	</td>
	<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
		<a href={`/${fact.id}`}>
			<div class="w-full h-full flex flex-col items-center">
				<div class="tooltip tooltip-left" data-tip="View Full Fact Statement">
					<OpenFolder fillColor={'fill-gray-500'} />
				</div>
			</div>
		</a>
	</td>
</tr>
