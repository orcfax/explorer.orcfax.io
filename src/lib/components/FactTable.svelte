<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import { getTableResults } from '$lib/client/api';
	import { createQuery } from '@tanstack/svelte-query';
	import type { FactStatement, GetFactsPageResponse } from '$lib/types';
	import { createTable, Render, Subscribe } from 'svelte-headless-table';
	import { addPagination } from 'svelte-headless-table/plugins';
	import * as Table from '$lib/components/ui/table';
	import Loading from '$lib/components/Loading.svelte';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import FormattedCurrencyValue from './FormattedCurrencyValue.svelte';
	import { error } from '@sveltejs/kit';
	import { getFeedUrl, getFormattedDate, getFormattedTime } from '$lib/client/helpers';
	import { networkStore } from '$lib/stores/network';
	import FactCardField from './FactCardField.svelte';

	export let feedFilter = '';
	export let onTableRowClick: (fact: FactStatement) => void = () => {};

	const currentPage = writable(1);
	const response = createQuery<GetFactsPageResponse, Error>(
		derived([currentPage, networkStore], ([$currentPage, $networkStore]) => ({
			queryKey: ['facts-page', $currentPage, $networkStore, feedFilter],
			queryFn: () => getTableResults($currentPage, $networkStore.network, feedFilter)
		}))
	);

	let facts = writable<FactStatement[]>([]);
	let totalFacts = writable<number>(0);

	response.subscribe((value) => {
		if (value.isSuccess) {
			facts.set(value.data.facts);
			totalFacts.set(value.data.totalFacts);
		}
	});

	const table = createTable(facts, {
		page: addPagination({
			serverSide: true,
			serverItemCount: totalFacts
		})
	});

	const columns = table.createColumns([
		...(feedFilter
			? []
			: [
					table.column({
						accessor: (fact) => {
							if (typeof fact.feed === 'string')
								error(400, 'Full feed required for table feed filter');
							else return fact.feed.feed_id;
						},
						header: 'Feed'
					})
				]),
		table.column({
			accessor: 'fact_urn',
			header: 'Fact Statement ID'
		}),
		table.column({
			accessor: 'value',
			header: 'Value'
		}),
		table.column({
			accessor: 'validation_date',
			header: 'Validation Date'
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex, pageCount } = pluginStates.page;

	pageIndex.subscribe((value) => {
		currentPage.set(value + 1);
	});
</script>

{#if $response.isLoading}
	<Loading />
{:else if $response.isError || !$response.data}
	<div class="rounded-md border">
		<div class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-700 font-semibold sm:pl-6">
			Something went wrong...
		</div>
	</div>
{:else}
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
							<Table.Row
								class="cursor-pointer"
								{...rowAttrs}
								on:click={() => {
									if (feedFilter) {
										onTableRowClick(row.original);
									} else {
										goto(getFeedUrl(row.original.feed, row.original.fact_urn));
									}
								}}
							>
								{#each row.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()} let:attrs>
										{#if cell.id === 'fact_urn'}
											<Table.Cell {...attrs}>
												<FactCardField
													name=""
													value={cell.value}
													allowCopyToClipboard
													ellipsisAndHover
												/>
											</Table.Cell>
										{:else if cell.id === 'value'}
											<Table.Cell {...attrs}>
												<FormattedCurrencyValue value={cell.value} />
											</Table.Cell>
										{:else if cell.id === 'validation_date'}
											<Table.Cell {...attrs}>
												{`${getFormattedDate(cell.value)} ${getFormattedTime(cell.value)}`}
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
				<span class="text-sm">{`Page ${$currentPage} of ${$pageCount.toLocaleString()}`}</span>
				<span class="text-xs text-muted-foreground">
					{`${$response.data.totalFacts.toLocaleString()} total Facts`}
				</span>
			</div>
			<div class="flex items-center justify-end space-x-4 pt-4">
				<Button
					variant="outline"
					size="sm"
					on:click={() => ($pageIndex = $pageIndex - 1)}
					disabled={!$hasPreviousPage}>Previous</Button
				>
				<Button
					variant="outline"
					size="sm"
					disabled={!$hasNextPage}
					on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
				>
			</div>
		</div>
	</div>
{/if}
