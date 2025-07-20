<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as Table from '$lib/components/ui/table';
</script>

<!-- Loading Skeleton for NodesTable -->
<div>
	<div class="rounded-md border bg-card">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Node ID</Table.Head>
					<Table.Head class="hidden lg:table-cell">Type</Table.Head>
					<Table.Head class="hidden md:table-cell">Status</Table.Head>
					<Table.Head class="hidden md:table-cell">Location</Table.Head>
					<Table.Head class="hidden lg:table-cell">Total Facts</Table.Head>
					<Table.Head>Last Collection</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each Array(6) as _, index}
					<Table.Row>
						<Table.Cell>
							<Skeleton class="h-4 w-32" />
						</Table.Cell>
						<Table.Cell class="hidden lg:table-cell">
							<Skeleton class="h-4 w-20" />
						</Table.Cell>
						<Table.Cell class="hidden md:table-cell">
							<div class="flex gap-2 items-center">
								<Skeleton class="h-3 w-3 rounded-full" />
								<Skeleton class="h-4 w-16" />
							</div>
						</Table.Cell>
						<Table.Cell class="hidden md:table-cell">
							<Skeleton class="h-4 w-24" />
						</Table.Cell>
						<Table.Cell class="hidden lg:table-cell">
							<Skeleton class="h-4 w-16" />
						</Table.Cell>
						<Table.Cell>
							<div class="flex flex-col items-start gap-1 w-min">
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
