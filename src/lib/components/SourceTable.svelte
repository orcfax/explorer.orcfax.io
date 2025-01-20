<script lang="ts">
	import { writable } from 'svelte/store';
	import type { SourceWithMetadata } from '$lib/types';
	import SourceBadge from './SourceBadge.svelte';
	import * as Table from '$lib/components/ui/table';
	import { createTable, Render, Subscribe } from 'svelte-headless-table';
	import { addGroupBy } from 'svelte-headless-table/plugins';
	import FactCardField from './FactCardField.svelte';
	import { formatNumber, formatSumValue } from '$lib/client/helpers';
	import LatestFactColumn from '$lib/components/LatestFactColumn.svelte';
	import FeedNameplate from '$lib/components/FeedNameplate.svelte';

	interface Props {
		sources: SourceWithMetadata[];
		showWithValues?: boolean;
	}

	let { sources, showWithValues = false }: Props = $props();

	const isCEX = sources.length > 0 && sources[0].type === 'CEX API';
	const isDEX = sources.length > 0 && sources[0].type === 'DEX LP';

	let sourcesStore = writable<SourceWithMetadata[]>(
		showWithValues ? sources : sources.sort((a, b) => a.name.localeCompare(b.name))
	);

	const highlightRow = (index: number, sources: SourceWithMetadata[], isCEX: boolean) => {
		const isOddSources = sources.length % 2 !== 0;
		const midIndex = Math.floor(sources.length / 2);

		if (!isCEX) return false;

		if (isOddSources) {
			return index === midIndex;
		} else {
			return index === midIndex || index === midIndex - 1;
		}
	};

	const table = createTable(sourcesStore, {
		group: addGroupBy()
	});

	const withValuesCols = [
		table.column({
			accessor: 'name',
			header: 'Name',
			plugins: {
				group: {
					disable: true
				}
			}
		}),
		...(sources.length > 0 && sources[0].type === 'CEX API'
			? [
					table.column({
						accessor: 'assetPairValue',
						header: `Value`
					})
				]
			: [
					table.column({
						accessor: 'baseAssetValue',
						header: 'Base'
					}),
					table.column({
						accessor: 'quoteAssetValue',
						header: 'Quote'
					})
				])
	];

	const withoutValuesCols = [
		table.column({
			accessor: 'name',
			header: 'Name'
		}),
		table.column({
			accessor: 'type',
			header: 'Type'
		}),
		table.column({
			accessor: 'totalFacts',
			header: 'Facts Sourced'
		}),
		table.column({
			accessor: 'latestFact',
			header: 'Last Sourced'
		})
	];

	const columns = table.createColumns(showWithValues ? withValuesCols : withoutValuesCols);

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
							<Table.Row
								{...rowAttrs}
								class={highlightRow(index, $sourcesStore, isCEX) && showWithValues
									? 'bg-muted/50'
									: ''}
							>
								{#each row.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()}>
										{#snippet children({ attrs })}
											{#if cell.id === 'name'}
												<Table.Cell {...attrs}>
													<div class="flex gap-3 items-center">
														<SourceBadge source={row.original} />
														<div class={`${isDEX ? 'hidden md:block' : ''}`}>
															{cell.value === 'bitfinex_simple'
																? 'Bitfinex'
																: cell.value === 'kucoin_prices_simple'
																	? 'Kucoin'
																	: cell.value}
														</div>
													</div>
												</Table.Cell>
											{:else if cell.id === 'type'}
												<Table.Cell {...attrs} class="hidden md:table-cell">
													<Render of={cell.render()} />
												</Table.Cell>
											{:else if cell.id === 'totalFacts'}
												<Table.Cell {...attrs}>
													<Render of={formatNumber(cell.render())} />
												</Table.Cell>
											{:else if cell.id === 'latestFact'}
												<Table.Cell {...attrs}>
													<div class="flex flex-col gap-2">
														<FeedNameplate feed={cell.value.feed} size="sm" />
														<LatestFactColumn latestFact={cell.value} />
													</div>
												</Table.Cell>
											{:else if cell.id === 'baseAssetValue' || cell.id === 'quoteAssetValue'}
												<Table.Cell {...attrs}>
													<FactCardField
														name=""
														value={cell.value}
														{maxFieldLength}
														ellipsisAndHover={innerWidth < 400}
													/>
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
				{#if showWithValues && isDEX}
					<Table.Row class="bg-muted/50">
						<Table.Cell>
							<div class="flex gap-3 items-center">
								<span class="text-sm font-semibold">Total:</span>
							</div>
						</Table.Cell>

						<Table.Cell>
							<div class="flex gap-3 items-center">
								<span class="text-sm font-semibold">
									<FactCardField
										name=""
										value={formatSumValue(
											sources.reduce((acc, source) => acc + (source.baseAssetValue || 0), 0)
										)}
									/>
								</span>
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex gap-3 items-center">
								<span class="text-sm font-semibold">
									<FactCardField
										name=""
										value={formatSumValue(
											sources.reduce((acc, source) => acc + (source.quoteAssetValue || 0), 0)
										)}
									/>
								</span>
							</div>
						</Table.Cell>
					</Table.Row>
				{/if}
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
