<script lang="ts">
	import { mode as theme } from 'mode-watcher';
	import json from 'svelte-highlight/languages/json';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import { atomOneLight, atomOneDark } from 'svelte-highlight/styles';
	import type { ArchivedFile } from '$lib/types';

	export let file: ArchivedFile | null;
</script>

<svelte:head>
	{@html $theme === 'dark' ? atomOneDark : atomOneLight}
</svelte:head>

<div class="h-full rounded-lg">
	{#if file}
		<div class="flex flex-col h-[50rem]">
			<div class="flex flex-col gap-1 px-4 pt-4 border-b">
				<div class="flex justify-between w-full pb-3">
					<h3 class="text-lg font-bold">{file.fileName}</h3>
					<h4 class="text-primary font-bold">{file.extension}</h4>
				</div>
			</div>

			<div
				class="overflow-auto h-full min-h-full"
				style={`background-color: ${$theme === 'dark' ? '#282C34' : '#FAFAFA'}`}
			>
				<Highlight
					class="overflow-y-scroll min-h-full h-full"
					language={json}
					code={typeof file.content === 'object'
						? JSON.stringify(file.content, null, 2)
						: file.content.trim()}
					let:highlighted
				>
					<LineNumbers {highlighted} />
				</Highlight>
			</div>
		</div>
	{/if}
</div>
