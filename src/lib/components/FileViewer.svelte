<script lang="ts">
	import { mode as theme } from 'mode-watcher';
	import json from 'svelte-highlight/languages/json';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import { atomOneLight, atomOneDark } from 'svelte-highlight/styles';
	import type { ArchivedFile } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import CopyToClipboard from './CopyToClipboard.svelte';

	interface Props {
		file: ArchivedFile | null;
	}

	let { file }: Props = $props();
</script>

<svelte:head>
	{@html $theme === 'dark' ? atomOneDark : atomOneLight}
</svelte:head>

<div class="h-full rounded-lg">
	{#if file}
		<div class="flex flex-col h-[50rem]">
			<div class="flex justify-between items-center w-full px-4 py-2 border-b h-min">
				<h3 class="text-lg font-bold">{file.fileName}</h3>
				<div class="flex justify-center items-center gap-2">
					<Tooltip.Root openDelay={150}>
						<Tooltip.Trigger>
							<div
								class="flex justify-center items-center rounded-full border border-card hover:bg-border/50 hover:border-border h-min"
							>
								<CopyToClipboard
									value={typeof file.content === 'string'
										? file.content
										: JSON.stringify(file.content, null, 2)}
									class="-mt-0 h-min"
								/>
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content side={'top'} sideOffset={6}>
							<p>Copy current file</p>
						</Tooltip.Content>
					</Tooltip.Root>

					<h4 class="font-bold">{file.extension}</h4>
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
				>
					{#snippet children({ highlighted })}
						<LineNumbers {highlighted} />
					{/snippet}
				</Highlight>
			</div>
		</div>
	{/if}
</div>
