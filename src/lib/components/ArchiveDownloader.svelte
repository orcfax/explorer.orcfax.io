<script lang="ts">
	import { networkStore } from '$lib/stores/network';
	import { Download, LoaderCircle } from 'lucide-svelte';
	import type { Archive } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { logError } from '$lib/client/api';
	import Loading from '$lib/components/Loading.svelte';

	export let archive: Archive;

	let isDownloading = false;

	async function handleDownload(archive: Archive) {
		try {
			isDownloading = true;
			if (!archive.details) return;

			const response = await fetch(
				`/api/archive?storageUrn=${encodeURIComponent(archive.fact.storage_urn)}&sourceType=${encodeURIComponent(archive.details.sourceType)}&networkID=${encodeURIComponent($networkStore.network.id)}`
			);
			if (!response.ok) {
				await logError(`Failed to fetch archive download for ${archive.fact.fact_urn}`);
				return;
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
			await logError(`Failed to download archive for ${archive.fact.fact_urn}`, error);
		} finally {
			isDownloading = false;
		}
	}
</script>

<Tooltip.Root openDelay={150}>
	<Tooltip.Trigger class="flex h-fit w-fit">
		<button
			class={`flex items-center gap-[0.15rem] rounded-lg text-sm text-primary/90 font-medium p-2 py-[.38rem] border bg-muted/50 hover:bg-border/60 hover:text-primary cursor-pointer disabled:opacity-50 disabled:cursor-wait`}
			disabled={isDownloading}
			class:cursor-wait={isDownloading}
			on:click={() => handleDownload(archive)}
		>
			<p class="px-1">{isDownloading ? 'Downloading' : 'Download'}</p>
			{#if isDownloading}
				<LoaderCircle class="stroke-primary h-[1.1rem] w-[1.1rem] animate-spin" />
			{:else}
				<Download class="stroke-primary h-[1.1rem] w-[1.1rem]" />
			{/if}
		</button>
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={10}>
		<p>Download full archive</p>
	</Tooltip.Content>
</Tooltip.Root>
