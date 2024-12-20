<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
</script>

<!-- Loading Skeleton -->
<section class="flex flex-col items-center w-full max-w-[30rem] sm:max-w-[45rem]">
	<h2 class="font-bold text-3xl pb-4 self-start whitespace-nowrap">Network Summary</h2>
	<div class="section-container w-full">
		<ul class="grid gap-7 w-full grid-cols-1 xs:grid-cols-2 min-w-0">
			<li class="col-span-1 w-full h-full">
				<Skeleton class="h-32 w-full min-h-[8rem] rounded-lg" />
			</li>
			<li class="col-span-1 w-full h-full">
				<Skeleton class="h-32 w-full min-h-[8rem] rounded-lg" />
			</li>
			<li class="col-span-1 w-full h-full">
				<Skeleton class="h-32 w-full min-h-[8rem] rounded-lg" />
			</li>
			<li class="col-span-1 w-full h-full">
				<Skeleton class="h-32 w-full min-h-[8rem] rounded-lg" />
			</li>
			<li class="col-span-1 xs:col-span-2 w-full h-full">
				<Skeleton class="h-32 w-full min-h-[8rem] rounded-lg" />
			</li>
		</ul>
	</div>
</section>
