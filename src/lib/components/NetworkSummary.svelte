<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import FactIcon from '$lib/icons/FactIcon.svelte';
	import DataSourceIcon from '$lib/icons/DataSourceIcon.svelte';
	// import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { OrcfaxStats } from '$lib/types';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { Nfc } from 'lucide-svelte';

	export let summary: OrcfaxStats;
</script>

<section class="flex flex-col items-center">
	<h2 class="font-bold text-3xl pb-4 self-start whitespace-nowrap">Network Summary</h2>
	<div class="section-container">
		<div class="flex flex-col space-y-7">
			<ul class="grid gap-7 max-h-fit grid-cols-1 xs:grid-cols-2 sm:grid-cols-3">
				<li>
					<Card.Root class="h-full">
						<Card.Header
							class="flex flex-row items-center justify-between space-y-0 space-x-2 pb-2"
						>
							<Card.Title class="text-sm font-medium">Active Feeds</Card.Title>
							<Nfc class="stroke-primary" size="30" />
						</Card.Header>
						<Card.Content>
							<div class="text-2xl font-bold">{summary.totalFeeds}</div>
							<a
								href="https://orcfax.io#connect"
								target="_blank"
								class="text-xs text-muted-foreground underline mt-1">Request a feed →</a
							>
						</Card.Content>
					</Card.Root>
				</li>
				<li>
					<Card.Root class="h-full">
						<Card.Header
							class="flex flex-row items-center justify-between space-y-0 space-x-6 pb-2"
						>
							<Card.Title class="text-sm font-medium">Published Facts</Card.Title>
							<FactIcon />
						</Card.Header>
						<Card.Content>
							<div class="text-2xl font-bold">
								{summary.totalFacts.toLocaleString()}
							</div>
							<p
								class="text-xs text-green-600 dark:text-green-500 font-bold dark:font-semibold mt-1"
							>
								+{summary.totalFacts24Hour.toLocaleString()} Today (UTC)
							</p>
						</Card.Content>
					</Card.Root>
				</li>
				<li>
					<Card.Root class="h-full">
						<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
							<Card.Title class="text-sm font-medium">Data Sources</Card.Title>
							<DataSourceIcon />
						</Card.Header>
						<Card.Content>
							<div class="text-2xl font-bold">10</div>
							<p class="text-xs mt-1">4 DEX LPs</p>
							<p class="text-xs">6 CEX APIs</p>
						</Card.Content>
					</Card.Root>
				</li>
			</ul>
			<InfoBox title="Orcfax v1 is live on Mainnet!">
				<p>
					Check out our <a
						href="https://docs.orcfax.io"
						target="_blank"
						class="text-primary underline">docs</a
					> to see what's new!
				</p>
			</InfoBox>
		</div>

		<!-- Loading Skeleton
			<ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(3) as _}
					<li class="relative h-32 w-48 border bg-transparent rounded-lg">
						<div class="flex flex-col w-full p-4 absolute top-0 left-0 space-y-2">
							<div class="flex w-full justify-between">
								<Skeleton class="h-5 w-20" />
								<Skeleton class="h-6 w-6 rounded-full" />
							</div>
							<Skeleton class="h-8 w-12" />
							<Skeleton class="h-4 w-20" />
						</div>
					</li>
				{/each}
			</ul> -->
	</div>
</section>
