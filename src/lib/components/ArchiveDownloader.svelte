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
	<Tooltip.Trigger class="flex h-fit w-fit">
		<button
			class="flex items-center gap-[0.15rem] rounded-lg text-sm text-primary/90 font-medium p-2 py-[.38rem] border bg-muted/50 hover:bg-border/60 hover:text-primary cursor-pointer"
			on:click={() => handleDownload(archive)}
		>
			<p class="px-1">Download</p>
			<Download class="stroke-primary h-[1.1rem] w-[1.1rem]" />
		</button>
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={10}>
		<p>Download full archive</p>
	</Tooltip.Content>
</Tooltip.Root>
