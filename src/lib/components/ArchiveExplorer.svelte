<script lang="ts">
	import TreeView from './TreeView/index.svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import FileViewer from './FileViewer.svelte';
	import { selectedItemStore } from '$lib/stores/archive';
	import type { FactStatement, Archive } from '$lib/types';

	export let archive: Archive | null;
	export let fact: FactStatement | null;

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
	<h3 class="font-bold text-2xl pb-4">Archive Explorer</h3>
	{#if archive && archive.directoryTree && archive.files}
		<Resizable.PaneGroup
			class="border-2 rounded-lg h-80 bg-card text-card-foreground"
			direction="horizontal"
		>
			<Resizable.Pane defaultSize={30}>
				<div class="overflow-auto">
					<TreeView directoryTree={archive.directoryTree} {fact} />
				</div>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={70}>
				<FileViewer file={selectedFile} />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	{:else}
		<div
			class="flex flex-col justify-center items-center text-center sm:text-start w-full rounded-lg bg-card text-card-foreground border"
		>
			<h4 class="text-lg pt-12 px-12 w-fit font-extrabold">Archive Unavailable</h4>
			<p class="pb-12 px-12 w-fit">Please check back or refresh in a few minutes.</p>
		</div>
	{/if}
</div>
