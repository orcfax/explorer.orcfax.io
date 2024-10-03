<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
</script>

<!-- Loading Skeleton -->
<div class="flex w-full justify-end mb-3 space-x-4">
	<div class="flex flex-col space-y-1">
		<Skeleton class="h-8 w-48" />
		<Skeleton class="h-4 w-32" />
	</div>
	<Skeleton class="h-8 w-32" />
</div>
<div class="flex flex-col w-full h-full min-h-96 p-6 border rounded-lg">
	<ul class="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
		{#each Array(6) as _}
			<li class="relative h-60 w-80">
				<Skeleton class="h-full w-full border bg-transparent absolute top-0 left-0" />
				<div class="flex flex-col w-full h-full absolute top-0 left-0 p-6">
					<div class="flex items-center space-x-2">
						<div class="flex relative -space-x-2">
							<Skeleton class="rounded-full h-11 w-11" />
							<Skeleton class="rounded-full h-11 w-11" />
						</div>

						<Skeleton class="h-4 w-24" />
					</div>
					<Skeleton class="h-3 w-32 mt-2" />
					<Skeleton class="h-7 w-28 mt-6" />
					<Skeleton class="h-3 w-48 mt-4" />
					<div class="flex w-full justify-center space-x-4 mt-auto">
						<Skeleton class="h-6 w-16 rounded-full" />
						<Skeleton class="h-6 w-16 rounded-full" />
						<Skeleton class="h-6 w-16 rounded-full" />
					</div>
				</div>
			</li>
		{/each}
	</ul>
</div>
