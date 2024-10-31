<script lang="ts">
	import TreeView from './TreeView/index.svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import FileViewer from './FileViewer.svelte';
	import { selectedItemStore, updateSelectedItem } from '$lib/stores/archive';
	import type { FactStatement, Archive } from '$lib/types';
	import { page } from '$app/stores';

	export let archive: Archive;
	export let fact: FactStatement;

	const initialSelectedIndex = parseInt($page.url.searchParams.get('archive') ?? '0');
	$: selectedFile = archive.files ? archive.files[initialSelectedIndex] : null;

	$: console.log(JSON.stringify(archive, null, 2));

	selectedItemStore.subscribe((value) => {
		if (value) {
			const file = archive.files?.[value];
			if (file) {
				selectedFile = file;
				const index = archive.files?.indexOf(file);
				updateSelectedItem($page.url, index);
			}
		}
	});
</script>

<div class="w-full">
	<h3 class="font-bold text-2xl pb-4">Archive Explorer</h3>
	{#if archive.directoryTree && archive.files}
		<Resizable.PaneGroup
			class="border-2 rounded-lg h-80 bg-card text-card-foreground"
			direction="horizontal"
		>
			<Resizable.Pane defaultSize={30}>
				<div class="overflow-auto">
					<TreeView {archive} {fact} />
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
