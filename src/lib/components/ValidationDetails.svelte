<script lang="ts">
	import type { Archive } from '$lib/types';
	import FactCardField from './FactCardField.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	export let archive: Promise<Archive> | null;
</script>

<section class="w-fit xl:w-full flex flex-col">
	<h3 class="hidden md:inline font-bold text-xl pb-4">Validation</h3>
	{#await archive}
		<Skeleton class="h-[10rem] w-[15rem]" />
	{:then archive}
		<div class="p-6 section-container bg-card text-card-foreground">
			{#if archive && archive.details}
				<div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-1 xl:grid-cols-1 gap-4">
					<FactCardField
						name="Content Signature"
						value={archive.details.contentSignature}
						ellipsisAndHover
						maxFieldLength={13}
					/>
					<FactCardField name="Validation Date" value={archive.details.validationDate} />
				</div>
			{:else}
				<div class="flex flex-col">
					<h4 class="font-bold text-lg">Data Unavailable</h4>
					<p>Please check back later.</p>
				</div>
			{/if}
		</div>
	{/await}
</section>
