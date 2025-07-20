<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as Table from '$lib/components/ui/table';
</script>

<!-- Loading Skeleton for SourceTable -->
<div>
	<div class="rounded-md border bg-card">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head class="hidden md:table-cell">Type</Table.Head>
					<Table.Head class="hidden md:table-cell">Facts Sourced</Table.Head>
					<Table.Head>Last Sourced</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each Array(8) as _, index}
					<Table.Row>
						<Table.Cell>
							<div class="flex gap-1 sm:gap-3 items-center w-fit">
								<Skeleton class="h-8 w-8 rounded" />
								<Skeleton class="h-4 w-20" />
							</div>
						</Table.Cell>
						<Table.Cell class="hidden md:table-cell">
							<Skeleton class="h-4 w-16" />
						</Table.Cell>
						<Table.Cell class="hidden md:table-cell">
							<Skeleton class="h-4 w-12" />
						</Table.Cell>
						<Table.Cell>
							<div class="flex flex-col gap-1">
								<div class="flex items-center gap-2">
									<Skeleton class="h-6 w-6 rounded-full" />
									<Skeleton class="h-6 w-6 rounded-full -ml-4" />
									<Skeleton class="h-4 w-16" />
								</div>
								<div class="flex flex-col gap-1">
									<Skeleton class="h-3 w-20" />
									<Skeleton class="h-3 w-16" />
								</div>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex justify-between">
		<div class="flex flex-col pt-2 pl-2">
			<Skeleton class="h-3 w-24" />
		</div>
	</div>
</div>
