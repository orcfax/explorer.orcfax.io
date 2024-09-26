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
		else {
			selectedItemStore.set(value.getAttribute('data-id'));
		}
	});
</script>

<div class="flex flex-col h-[50rem]">
	<div class="flex flex-col gap-1 pt-4">
		<div class="flex justify-between">
			<h3 class="text-lg font-bold pl-4 pb-2">Files</h3>
			<Tooltip.Root openDelay={150}>
				<Tooltip.Trigger>
					<a
						href={getArweaveUrl($networkStore.network, fact.storage_urn)}
						class="cursor-pointer"
						target="_blank"
					>
						<Download class="stroke-primary mx-2 -mt-2" />
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Download Fact Statement Archive from Arweave</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
		<hr />
	</div>

	<ul class="overflow-auto px-4 pb-2 pt-2 h-full" {...$tree}>
		<Tree {treeItems} />
	</ul>
</div>
