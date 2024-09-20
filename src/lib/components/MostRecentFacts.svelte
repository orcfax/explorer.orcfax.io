<script lang="ts">
	import type { FactStatement } from '$lib/types';
	import FactCard from './FactCard.svelte';

	export let mostRecentFacts: FactStatement[];
	let firstItemID = mostRecentFacts[0].id;
</script>

<ol class="carousel carousel-center w-full p-4 space-x-4 rounded-box fit-content self-end">
	{#each mostRecentFacts as fact (fact.id)}
		<FactCard {fact} isFirstInList={firstItemID === fact.id} />
	{/each}
</ol>
