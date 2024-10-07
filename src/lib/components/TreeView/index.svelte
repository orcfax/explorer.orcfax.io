<script lang="ts">
	import { createTreeView } from '@melt-ui/svelte';
	import { setContext } from 'svelte';
	import type { TreeItem } from './tree.svelte';
	import Tree from './tree.svelte';
	import type { DirectoryNode } from '$lib/types';
	import { writable } from 'svelte/store';
	import { selectedItemStore } from '$lib/stores/archive';
	import { getArweaveUrl, networkStore } from '$lib/stores/network';
	import type { FactStatement } from '$lib/types';
	import { Download } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export let directoryTree: DirectoryNode[];
	export let fact: FactStatement;

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

	$: treeItems = convertNodesIntoTreeItems(directoryTree);

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
</script>

<div class="flex flex-col h-[50rem]">
	<div class="flex flex-col">
		<div class="flex justify-between items-center px-1 py-2 pr-2">
			<h3 class="text-lg font-bold pl-4">Files</h3>
			<Tooltip.Root openDelay={150}>
				<Tooltip.Trigger class="flex h-9 w-9">
					<a
						href={getArweaveUrl($networkStore.network, fact.storage_urn)}
						class="cursor-pointer"
						target="_blank"
					>
						<div class="rounded-full p-2 border border-card hover:bg-border/50 hover:border-border">
							<Download class="stroke-primary h-5 w-5" />
						</div>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content sideOffset={10}>
					<p>Download archive from Arweave</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
		<hr />
	</div>

	<ul class="overflow-auto px-4 pb-2 pt-2 h-full" {...$tree}>
		<Tree {treeItems} />
	</ul>
</div>
