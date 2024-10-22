<script lang="ts">
	import { Download } from 'lucide-svelte';
	import type { Archive } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export let archive: Archive;

	async function handleDownload() {
		try {
			if (!archive.details) return;

			const response = await fetch(
				`/api/archive?storage_urn=${encodeURIComponent(archive.fact.storage_urn)}&sourceType=${encodeURIComponent(archive.details.sourceType)}`
			);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = 'archive.zip';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download failed:', error);
		}
	}
</script>

<Tooltip.Root openDelay={150}>
	<Tooltip.Trigger class="flex h-9 w-9">
		<button class="cursor-pointer" on:click={handleDownload}>
			<div class="rounded-full p-2 border border-card hover:bg-border/50 hover:border-border">
				<Download class="stroke-primary h-5 w-5" />
			</div>
		</button>
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={10}>
		<p>Download archive from Arweave</p>
	</Tooltip.Content>
</Tooltip.Root>
