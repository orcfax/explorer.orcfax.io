<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	export let isOnlyChart = false;
</script>

<div
	class={`flex flex-col justify-center items-center w-full relative ${isOnlyChart ? 'border-none' : 'border border-t-0 rounded-lg rounded-t-none'} p-2 md:p-6 pt-0 md:pt-0`}
	`
>
	{#if !isOnlyChart}
		<div class="flex justify-start items-center space-x-2 w-full">
			<Skeleton class="h-10 w-32 self-end my-4 border" />
			<Skeleton class="w-56 h-5 border rounded-full" />
		</div>
	{/if}

	<Skeleton
		class="h-[135px] xxxs:h-[165px] xxs:h-[185px] xs:h-[225px] sm:h-[295px] md:h-[320px] lg:h-[446px] xl:h-[575px] w-full border"
	/>
</div>
