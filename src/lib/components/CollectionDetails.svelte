<script lang="ts">
	import type { Archive } from '$lib/types';
	import SourceBadge from './SourceBadge.svelte';

	export let archive: Archive;
</script>

<section class="w-full md:w-max flex flex-col">
	<h3 class="font-bold text-2xl pb-4">Collection Details</h3>
	<div class="p-6 section-container bg-card text-card-foreground">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
			<div class="flex flex-col space-y-2">
				<h4 class="font-bold">Sources:</h4>
				{#if archive.sources && archive.sources.length > 0}
					<div class="flex space-x-1">
						{#each archive.sources as source}
							<SourceBadge {source} />
						{/each}
					</div>
				{:else}
					<p>Data not found</p>
				{/if}
			</div>
		</div>
	</div>
</section>
