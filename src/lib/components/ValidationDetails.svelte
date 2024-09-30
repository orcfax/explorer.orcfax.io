<script lang="ts">
	import type { Archive } from '$lib/types';
	import FactCardField from './FactCardField.svelte';

	export let archive: Promise<Archive>;
</script>

{#await archive then archive}
	{#if archive.sources}
		<section class="w-fit md:w-full flex flex-col">
			<h3 class="font-bold text-2xl pb-4">Validation Details</h3>
			<div class="p-6 section-container bg-card text-card-foreground">
				<div class="grid grid-cols-1 gap-4">
					{#if archive.sources && archive.sources.length > 0}
						<FactCardField
							name="Content Signature"
							value={archive.validationDetails?.contentSignature ?? '-'}
							ellipsisAndHover
						/>
						<FactCardField
							name="Validation Date"
							value={archive.validationDetails?.validationDate ?? '-'}
						/>
					{:else}
						<p>Source data unavailable</p>
					{/if}
				</div>
			</div>
		</section>
	{/if}
{/await}
