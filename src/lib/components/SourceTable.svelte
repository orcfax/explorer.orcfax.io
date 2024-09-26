<script lang="ts">
	import { writable } from 'svelte/store';
	import type { Source } from '$lib/types';
	import SourceBadge from './SourceBadge.svelte';
	import * as Table from '$lib/components/ui/table';
	import { createTable, Render, Subscribe } from 'svelte-headless-table';

	export let sources: Source[];

	let sourcesStore = writable<Source[]>(sources);

	const table = createTable(sourcesStore);

	const columns = table.createColumns([
		table.column({
			accessor: 'name',
			header: 'Name'
		}),
		table.column({
			accessor: 'type',
			header: 'Type'
		}),
		table.column({
			accessor: 'website',
			header: 'Website'
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<div>
	<div class="rounded-md border bg-card">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
									<Table.Head {...attrs}>
										<Render of={cell.render()} />
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									{#if cell.id === 'name'}
										<Table.Cell {...attrs}>
											<div class="flex gap-3 items-center">
												<SourceBadge source={row.original} hideTooltip />
												<Render of={cell.render()} />
											</div>
										</Table.Cell>
									{:else if cell.id === 'type'}
										<Table.Cell {...attrs}>
											<Render of={cell.render()} />
										</Table.Cell>
									{:else if cell.id === 'website'}
										<Table.Cell {...attrs}>
											<Render of={cell.render()} />
										</Table.Cell>
									{:else}
										<Table.Cell {...attrs}>
											<Render of={cell.render()} />
										</Table.Cell>
									{/if}
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex justify-between">
		<div class="flex flex-col pt-2 pl-2">
			<span class="text-xs text-muted-foreground">
				{`${sources.length} total Sources`}
			</span>
		</div>
	</div>
</div>
