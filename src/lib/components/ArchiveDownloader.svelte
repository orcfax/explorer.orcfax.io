<script lang="ts">
	import { Download } from 'lucide-svelte';
	import type { Archive } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export let archive: Archive;

	async function handleDownload(archive: Archive) {
		try {
			if (!archive.details) return;

			const response = await fetch(
				`/api/archive?storageUrn=${encodeURIComponent(archive.fact.storage_urn)}&sourceType=${encodeURIComponent(archive.details.sourceType)}`
			);
			if (!response.ok) {
				throw new Error('Network error');
			}

			// Extract the filename from the header
			const contentDisposition = response.headers.get('Content-Disposition');
			let filename = 'orcfax-archive.zip'; // Default filename in case parsing fails
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="(.+?)"/);
				if (match && match[1]) {
					filename = match[1];
				}
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
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
		<button class="cursor-pointer" on:click={() => handleDownload(archive)}>
			<div class="rounded-full p-2 border border-card hover:bg-border/50 hover:border-border">
				<Download class="stroke-primary h-5 w-5" />
			</div>
		</button>
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={10}>
		<p>Download archive from Arweave</p>
	</Tooltip.Content>
</Tooltip.Root>
