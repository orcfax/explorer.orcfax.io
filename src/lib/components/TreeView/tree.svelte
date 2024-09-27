<script context="module" lang="ts">
	import { ArrowRightFromLine, Folder, FolderOpen } from 'lucide-svelte';

	type Icon = 'folder';

	export type TreeItem = {
		title: string;
		icon?: Icon;
		children?: TreeItem[];
	};

	export const icons = {
		folder: Folder,
		folderOpen: FolderOpen,
		highlight: ArrowRightFromLine
	};
</script>

<script lang="ts">
	import { melt, type TreeView } from '@melt-ui/svelte';
	import { afterUpdate, getContext } from 'svelte';
	import { selectedItemStore } from '$lib/stores/archive';

	export let treeItems: TreeItem[];
	export let level = 1;

	const {
		elements: { item, group },
		helpers: { isExpanded },
		states: { selectedItem }
	} = getContext<TreeView>('tree');

	const refs: HTMLElement[] = [];
	let wasDefaultSet = false;

	// Set the first item as selected by default.
	afterUpdate(() => {
		if (wasDefaultSet) return;

		const firstFile = refs.find((ref) => ref.getAttribute('data-id') === `bag-info.txt-0`);
		if (firstFile) {
			selectedItem.set(firstFile);
		}
		wasDefaultSet = true;
	});
</script>

{#each treeItems as { title, children, icon }, i}
	{@const itemId = `${title}-${i}`}
	{@const hasChildren = !!children?.length}

	<li class={level !== 1 ? 'pl-4' : ''}>
		<button
			class="flex items-center gap-1 rounded-md p-1 px-2 focus:ring-2 focus:ring-ring focus:outline-none"
			class:bg-input={$selectedItemStore && itemId.includes($selectedItemStore)}
			use:melt={$item({
				id: itemId,
				hasChildren
			})}
			bind:this={refs[i]}
		>
			{#if icon === 'folder' && hasChildren}
				<svelte:component
					this={icons[$isExpanded(itemId) ? 'folderOpen' : 'folder']}
					class="h-4 w-4"
				/>
			{/if}

			<!-- {#if $selectedItemStore && itemId.includes($selectedItemStore)}
				<svelte:component this={icons['highlight']} class="h-5 w-5 stroke-primary" />
			{/if} -->

			<span class="select-none overflow-ellipsis whitespace-nowrap">{title}</span>
		</button>

		{#if children}
			<ul use:melt={$group({ id: itemId })}>
				<svelte:self treeItems={children} level={level + 1} />
			</ul>
		{/if}
	</li>
{/each}

<style>
	/* Remove docs' focus box-shadow styling. */
	li:focus {
		box-shadow: none !important;
	}
</style>
