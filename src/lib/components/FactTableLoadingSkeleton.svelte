<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as Table from '$lib/components/ui/table';
	import { networkStore } from '$lib/stores/network';

	export let feedFilter = '';
</script>

<!-- Loading Skeleton for FactTable -->
<div>
	<div class="rounded-md border bg-card">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#if !feedFilter}
						<Table.Head>Feed</Table.Head>
					{/if}
					<Table.Head class="hidden md:table-cell">Fact Statement ID</Table.Head>
					<Table.Head>Value</Table.Head>
					<Table.Head>Validation Date</Table.Head>
					{#if $networkStore.network.name !== 'Preview'}
						<Table.Head class="hidden lg:table-cell">Collected By</Table.Head>
					{/if}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each Array(8) as _, index}
					<Table.Row>
						{#if !feedFilter}
							<Table.Cell>
								<div class="flex items-center gap-2">
									<Skeleton class="h-8 w-8 rounded-full" />
									<Skeleton class="h-8 w-8 rounded-full -ml-4" />
									<Skeleton class="h-4 w-20" />
								</div>
							</Table.Cell>
						{/if}
						<Table.Cell class="hidden md:table-cell">
							<Skeleton class="h-4 w-32" />
						</Table.Cell>
						<Table.Cell>
							<Skeleton class="h-4 w-16" />
						</Table.Cell>
						<Table.Cell>
							<div class="flex flex-col gap-1">
								<Skeleton class="h-4 w-24" />
								<Skeleton class="h-3 w-16" />
							</div>
						</Table.Cell>
						{#if $networkStore.network.name !== 'Preview'}
							<Table.Cell class="hidden lg:table-cell">
								<Skeleton class="h-4 w-28" />
							</Table.Cell>
						{/if}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex flex-col xxxs:flex-row justify-between">
		<div class="flex flex-col pt-2 pl-2 gap-1">
			<Skeleton class="h-4 w-24" />
			<Skeleton class="h-3 w-32" />
		</div>
		<div class="flex items-center justify-end space-x-4 pt-4">
			<Skeleton class="h-8 w-20" />
			<Skeleton class="h-8 w-16" />
		</div>
	</div>
</div>
