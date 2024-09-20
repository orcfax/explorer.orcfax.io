<script context="module" lang="ts">
	import { ArrowLeft, Folder, FolderOpen } from 'lucide-svelte';

	type Icon = 'folder';

	export type TreeItem = {
		title: string;
		icon?: Icon;
		children?: TreeItem[];
	};

	export const icons = {
		folder: Folder,
		folderOpen: FolderOpen,
		highlight: ArrowLeft
	};
</script>

<script lang="ts">
	import { melt, type TreeView } from '@melt-ui/svelte';
	import { getContext } from 'svelte';

	export let treeItems: TreeItem[];
	export let level = 1;

	const {
		elements: { item, group },
		helpers: { isExpanded }
	} = getContext<TreeView>('tree');
</script>

{#each treeItems as { title, children, icon }, i}
	{@const itemId = `${title}-${i}`}
	{@const hasChildren = !!children?.length}

	<li class={level !== 1 ? 'pl-4' : ''}>
		<button
			class="flex items-center gap-1 rounded-md p-1 focus:bg-secondary"
			use:melt={$item({
				id: itemId,
				hasChildren
			})}
		>
			<!-- Add icon. -->
			{#if icon === 'folder' && hasChildren}
				<svelte:component
					this={icons[$isExpanded(itemId) ? 'folderOpen' : 'folder']}
					class="h-4 w-4"
				/>
			{/if}

			<span class="select-none overflow-ellipsis whitespace-nowrap">{title}</span>

			<!-- Selected icon. -->
			<!-- {#if $isSelected(itemId)}
				<svelte:component this={icons['highlight']} class="h-4 w-4" />
			{/if} -->
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
