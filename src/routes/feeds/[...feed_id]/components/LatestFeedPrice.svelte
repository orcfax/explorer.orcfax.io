<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { createTimeSinceStore } from '$lib/stores/time';
	import PriceDifferenceBadges from '$lib/components/PriceDifferenceBadges.svelte';
	import FormattedCurrencyValue from '$lib/components/FormattedCurrencyValue.svelte';
	import type { FactStatement, Feed } from '$lib/types';

	interface Props {
		feed: Feed;
		onLatestFactClick: (latestFact: FactStatement) => void;
	}

	let { feed, onLatestFactClick }: Props = $props();

	let timeSinceLastUpdate = $derived(createTimeSinceStore(feed.latestFact.validation_date));
</script>

<div class="flex flex-col h-max gap-4 w-full relative">
	<div
		class="flex flex-row justify-evenly items-center space-x-4 space-y-0 p-4 bg-card text-card-foreground border-[2px] rounded-lg xs:justify-around xs:rounded-none xs:border-l-[3px] xs:border-b-[3px] xs:rounded-tr-lg xs:rounded-bl-lg xs:max-w-max xs:-mr-[18px] xs:-mt-[18px] xs:absolute xs:top-0 xs:right-0 md:space-x-8"
	>
		<div class="flex flex-col">
			<h3 class="font-bold">Latest Value:</h3>
			<button
				type="button"
				class="text-xl whitespace-nowrap w-min font-bold"
				onclick={() => onLatestFactClick(feed.latestFact)}
			>
				<FormattedCurrencyValue
					value={feed.latestFact.value}
					class="water-reflection-text water-reflection-underline"
				/>
			</button>

			<Tooltip.Root openDelay={150}>
				<Tooltip.Trigger>
					<p class="text-xs text-start mt-2 text-card-foreground">
						{$timeSinceLastUpdate}
					</p>
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom">
					<p>
						{`${feed.latestFact.validation_date_formatted} ${feed.latestFact.validation_time_formatted}`}
					</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
		<PriceDifferenceBadges
			{feed}
			class="space-y-2 w-fit self-end md:flex md:space-y-0 md:space-x-2 md:self-center lg:flex-col lg:space-y-2 lg:space-x-0"
		/>
	</div>
</div>
