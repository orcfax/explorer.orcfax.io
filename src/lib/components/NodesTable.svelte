<script lang="ts">
	import type { FactStatement, NodeWithMetadata } from '$lib/types';
	import type { ColumnDef } from '@tanstack/table-core';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';

	interface Props {
		nodes: NodeWithMetadata[];
	}

	let { nodes }: Props = $props();

	let columns: ColumnDef<NodeWithMetadata>[] = $state([
		{
			accessorKey: 'node_urn',
			header: 'Node ID'
		},
		{
			accessorKey: 'type',
			header: 'Type'
		},
		{
			accessorKey: 'status',
			header: 'Status'
		},
		{
			accessorKey: 'address_locality',
			header: 'Location'
		},
		{
			accessorKey: 'totalFacts',
			header: 'Total Facts'
		},
		{
			accessorKey: 'latestFact',
			header: 'Last Collection'
		}
	]);
</script>

<DataTable {columns} data={nodes} />

<!-- <script lang="ts">
	import type { NodeWithMetadata } from '$lib/types';
	import { writable, type Readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { addGroupBy } from 'svelte-headless-table/plugins';
	import { createTable, Render, Subscribe } from 'svelte-headless-table';
	import FactCardField from '$lib/components/FactCardField.svelte';
	import { formatNumber, toTitleCase } from '$lib/client/helpers';
	import PingStatus from '$lib/components/PingStatus.svelte';
	import { createTimeSinceStore } from '$lib/stores/time';
	import LatestFactColumn from '$lib/components/LatestFactColumn.svelte';
	import FeedNameplate from '$lib/components/FeedNameplate.svelte';

	interface Props {
		nodes: NodeWithMetadata[];
	}

	let { nodes }: Props = $props();

	let nodesStore = writable<(NodeWithMetadata & { lastCollected: Readable<string> | null })[]>(
		nodes.map((node) => ({
			...node,
			lastCollected: node.latestFact ? createTimeSinceStore(node.latestFact.validation_date) : null
		}))
	);

	const table = createTable(nodesStore, {
		group: addGroupBy()
	});

	const cols = [
		table.column({
			accessor: 'node_urn',
			header: 'Node ID'
		}),
		table.column({
			accessor: 'type',
			header: 'Type'
		}),
		table.column({
			accessor: 'status',
			header: 'Status'
		}),
		table.column({
			accessor: 'address_locality',
			header: 'Location'
		}),
		table.column({
			accessor: 'totalFacts',
			header: 'Total Facts'
		}),
		table.column({
			accessor: 'latestFact',
			header: 'Last Collection'
		})
	];

	const columns = table.createColumns(cols);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);

	let innerWidth = $state(0);
	let innerHeight = $state(0);

	let maxFieldLength = $derived(innerWidth < 400 ? 8 : 100);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div>
	<div class="rounded-md border bg-card">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} props={cell.props()}>
									{#snippet children({ attrs })}
										{#if cell.id === 'type'}
											<Table.Head {...attrs} class="hidden md:table-cell">
												<Render of={cell.render()} />
											</Table.Head>
										{:else}
											<Table.Head {...attrs}>
												<Render of={cell.render()} />
											</Table.Head>
										{/if}
									{/snippet}
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row, index (row.id)}
					<Subscribe rowAttrs={row.attrs()}>
						{#snippet children({ rowAttrs })}
							<Table.Row {...rowAttrs}>
								{#each row.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()}>
										{#snippet children({ attrs })}
											{#if cell.id === 'node_urn'}
												<Table.Cell {...attrs}>
													<FactCardField
														name=""
														value={cell.value}
														allowCopyToClipboard
														ellipsisAndHover
													/>
												</Table.Cell>
											{:else if cell.id === 'type'}
												<Table.Cell {...attrs}>
													<Render of={toTitleCase(cell.render())} />
												</Table.Cell>
											{:else if cell.id === 'status'}
												<Table.Cell {...attrs}>
													<div class="flex gap-2 items-center">
														<PingStatus
															color={cell.render() === 'active' ? 'green' : 'yellow'}
															size="md"
														/>
														<Render of={toTitleCase(cell.render())} />
													</div>
												</Table.Cell>
											{:else if cell.id === 'latestFact'}
												<Table.Cell {...attrs}>
													<div class="flex flex-col gap-2">
														<FeedNameplate feed={cell.value.feed} size="sm" />
														<LatestFactColumn latestFact={cell.value} />
													</div>
												</Table.Cell>
											{:else if cell.id === 'totalFacts'}
												<Table.Cell {...attrs}>
													<Render of={formatNumber(cell.render())} />
												</Table.Cell>
											{:else}
												<Table.Cell {...attrs}>
													<Render of={cell.render()} />
												</Table.Cell>
											{/if}
										{/snippet}
									</Subscribe>
								{/each}
							</Table.Row>
						{/snippet}
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex justify-between">
		<div class="flex flex-col pt-2 pl-2">
			<span class="text-xs text-muted-foreground">
				{`${nodes.length} total Nodes`}
			</span>
		</div>
	</div>
</div> -->
