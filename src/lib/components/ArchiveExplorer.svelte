<script lang="ts">
	import TreeView from '$lib/components/TreeView/index.svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import FileViewer from './FileViewer.svelte';
	import { selectedItemStore } from '$lib/stores/archive';
	import type { Archive } from '$lib/types';
	import ArchiveDownloader from '$lib/components/ArchiveDownloader.svelte';
	import { networkStore } from '$lib/stores/network';

	export let archive: Archive | null;
	export let isArchiveIndexed: boolean;

	const { network } = $networkStore;

	// TODO: enable url store archive nav
	// $: selectedFile = archive && archive.files ? archive.files[0] : null;

	// selectedItemStore.subscribe((value) => {
	// 	if (value && archive) {
	// 		const file = archive.files?.[value];
	// 		if (file) {
	// 			selectedFile = file;
	// 			const index = archive.files?.indexOf(file);
	// 			updateSelectedItem($page.url, index);
	// 		}
	// 	}
	// });

	$: selectedFile = archive && archive.files ? archive.files[0] : null;

	selectedItemStore.subscribe((value) => {
		if (value) {
			const file =
				archive &&
				archive.files?.find((file) => file.fileName.includes(value.substring(0, value.length - 2)));
			if (file) selectedFile = file;
		}
	});
</script>

<div class="w-full">
	<div class="flex gap-4">
		<h3 class="font-bold text-2xl pb-4">Archive Explorer</h3>
		{#if isArchiveIndexed && archive?.details}
			<ArchiveDownloader {archive} />
		{/if}
	</div>

	{#if isArchiveIndexed && archive && archive.directoryTree && archive.files}
		<Resizable.PaneGroup
			class="border-2 rounded-lg h-80 bg-card text-card-foreground"
			direction="horizontal"
		>
			<Resizable.Pane defaultSize={30}>
				<div class="overflow-auto">
					<TreeView {archive} />
				</div>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={70}>
				<FileViewer file={selectedFile} />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	{:else if network.name === 'Preview'}
		<div
			class="flex flex-col justify-center items-center text-center sm:text-start w-full rounded-lg bg-card text-card-foreground border"
		>
			<h4 class="text-lg p-12 w-fit">Unavailable for this network</h4>
		</div>
	{:else if isArchiveIndexed === false}
		<div
			class="flex flex-col justify-center items-center text-center sm:text-start w-full rounded-lg bg-card text-card-foreground border"
		>
			<h4 class="text-lg pt-12 px-12 w-fit font-extrabold">
				Fact Statement not archived on Arweave yet
			</h4>
			<p class="pb-12 px-12 w-fit">Please check back later.</p>
		</div>
	{:else}
		<div
			class="flex flex-col justify-center items-center text-center sm:text-start w-full rounded-lg bg-card text-card-foreground border"
		>
			<h4 class="text-lg pt-12 px-12 w-fit font-extrabold">
				Failed to fetch Fact Statement archive
			</h4>
			<p class="pb-12 px-12 w-fit">Please check back or refresh in a few minutes.</p>
		</div>
	{/if}
</div>
