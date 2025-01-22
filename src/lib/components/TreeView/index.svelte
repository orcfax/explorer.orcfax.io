<script lang="ts">
	import { createTreeView } from '@melt-ui/svelte';
	import { setContext } from 'svelte';
	import type { TreeItem } from './tree.svelte';
	import Tree from './tree.svelte';
	import type { DirectoryNode } from '$lib/types';
	import { writable } from 'svelte/store';
	import type { Archive } from '$lib/types';
	// import { updateSelectedItem } from '$lib/stores/archive';
	// import { page } from '$app/stores';
	import { selectedItemStore } from '$lib/stores/archive';

	export let archive: Archive;

	function convertNodesIntoTreeItems(nodes: DirectoryNode[]): TreeItem[] {
		const treeItems: TreeItem[] = nodes.map((node) => {
			if (node.type === 'folder') {
				return {
					title: node.name,
					icon: 'folder',
					children: node.nodes ? convertNodesIntoTreeItems(node.nodes) : undefined
				};
			} else {
				return { title: node.name };
			}
		});

		return treeItems;
	}

	$: treeItems = convertNodesIntoTreeItems(
		archive && archive.directoryTree ? archive.directoryTree : []
	);

	let expanded = writable<string[]>([]);

	// Expand both folders by default. Not sure how to do this in a more idomatic way.
	$: expanded.set([
		`${treeItems[0].title}-0`,
		`${treeItems[0].children ? treeItems[0].children[2].title + '-2' : ''}`
	]);

	const ctx = createTreeView({
		expanded
	});
	setContext('tree', ctx);

	const {
		elements: { tree },
		states: { selectedItem }
	} = ctx;

	selectedItem.subscribe((value) => {
		if (!value) selectedItemStore.set(null);
		// If the item is a folder, do not select it
		else if (value.hasAttribute('aria-expanded')) return;
		else {
			selectedItemStore.set(value.getAttribute('data-id'));
		}
	});

	// selectedItem.subscribe((value) => {
	// 	if (!value) updateSelectedItem($page.url, 0);
	// 	// If the item is a folder, do not select it
	// 	else if (value.hasAttribute('aria-expanded')) return;
	// 	else {
	// 		// updateSelectedItem($page.url, parseInt(value.getAttribute('data-id').split('-')[1]));
	// 		// selectedItemStore.set(value.getAttribute('data-id'));
	// 	}
	// });
</script>

<div class="flex flex-col h-[50rem]">
	<div class="flex justify-between items-center border-b px-1 py-2 pr-2 h-[52px]">
		<h3 class="text-lg font-bold pl-4 pr-2">Files</h3>
	</div>

	<ul class="overflow-auto px-4 pb-2 pt-2 h-full" {...$tree}>
		<Tree {treeItems} />
	</ul>
</div>
