<script lang="ts">
	import type { FactStatement, Feed } from '$lib/types';
	import FactCardField from './FactCardField.svelte';
	import BlockchainBadges from './BlockchainBadges.svelte';
	import FormattedCurrencyValue from './FormattedCurrencyValue.svelte';
	import FeedNameplate from '$lib/components/FeedNameplate.svelte';

	export let fact: FactStatement;
	export let feed: Feed;

	let innerWidth = 0;
	let innerHeight = 0;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<section class="flex flex-col bg-card">
	<div
		class="p-6 rounded-lg bg-muted dark:bg-muted/50 text-card-foreground border-primary/20 border-2 min-w-max"
	>
		<header class="flex flex-col">
			<h4 class="text-lg self-center font-semibold">The price of</h4>
			<h4 class="self-center font-extrabold text-primary">
				{@html fact.description}
			</h4>
			<h4 class="self-center font-semibold text-primary">
				({@html fact.inverse_description})
			</h4>
			<h5 class="text-base text-center font-medium">on {fact.validation_date_formatted}</h5>
			<h5 class="text-base text-center font-medium">at {fact.validation_time_formatted}</h5>
			<div class="divider my-2" />
		</header>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 p-2 pt-0 pb-2 gap-3">
			<div class="flex flex-col">
				<p class="font-bold pb-1">Feed:</p>
				<FeedNameplate {feed} size="md" />
				<p class="text-sm text-muted-foreground">
					{feed.type_description}
				</p>
			</div>

			<div class="flex">
				<div class="flex flex-col">
					<p class="font-bold">Value:</p>
					<div class="flex gap-2">
						<FormattedCurrencyValue value={fact.value} />
					</div>
				</div>
			</div>

			<FactCardField
				name="Fact Statement ID"
				value={fact.fact_urn}
				allowCopyToClipboard
				ellipsisAndHover
				maxFieldLength={18}
			/>
			<FactCardField
				name="Validation Date"
				value={`${fact.validation_date_formatted} ${fact.validation_time_formatted}`}
				accessory=""
			/>
		</div>
		<BlockchainBadges {fact} class="mt-2 -mb-4 -ml-6" />
	</div>
</section>
