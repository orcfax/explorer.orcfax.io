<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import FactIcon from '$lib/icons/FactIcon.svelte';
	import DataSourceIcon from '$lib/icons/DataSourceIcon.svelte';
	import type { OrcfaxStats, Notification } from '$lib/types';
	import { Nfc, SatelliteDish } from 'lucide-svelte';
	import NodeIcon from '$lib/icons/NodeIcon.svelte';
	import PingStatus from '$lib/components/PingStatus.svelte';
	import { networkStore } from '$lib/stores/network';
	import { marked } from 'marked';

	export let summary: OrcfaxStats;
	export let latestNetworkUpdate: Notification;
	export let activeIncidents: number;

	const { network } = $networkStore;

	$: totalNodes = summary.nodes.length;
	$: activeNodes = summary.nodes.filter((node) => node.status === 'active').length;
	$: totalSources = summary.sources.length;
	$: dexSources = summary.sources.filter((source) => source.type === 'DEX LP').length;
	$: cexSources = summary.sources.filter((source) => source.type === 'CEX API').length;
</script>

<section class="flex flex-col items-center">
	<h2 class="font-bold text-3xl pb-4 self-start whitespace-nowrap">Network Summary</h2>
	<div class="section-container">
		<ul class="grid gap-7 max-h-fit grid-cols-1 xs:grid-cols-2 sm:grid-cols-3">
			<li class="col-span-1">
				<Card.Root class="h-full">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 space-x-2 pb-0">
						<Card.Title class="text-sm font-medium">
							<a href="#feeds" class="underline">Active Feeds</a>
						</Card.Title>
						<Nfc class="stroke-primary" size="30" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{summary.totalActiveFeeds}</div>
						<a
							href="https://orcfax.io#connect"
							target="_blank"
							class="text-xs text-muted-foreground underline mt-1">Request a feed →</a
						>
					</Card.Content>
				</Card.Root>
			</li>
			<li class="col-span-1">
				<Card.Root class="h-full">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 space-x-6 pb-0">
						<Card.Title class="text-sm font-medium">
							<a href="#facts" class="underline">Published Facts</a>
						</Card.Title>
						<FactIcon />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">
							{summary.totalFacts.toLocaleString()}
						</div>
						<p class="text-xs text-green-600 dark:text-green-500 font-bold dark:font-semibold mt-1">
							+{summary.totalFacts24Hour.toLocaleString()} Today (UTC)
						</p>
					</Card.Content>
				</Card.Root>
			</li>
			<li class="col-span-1">
				<Card.Root class="h-full">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-0">
						<Card.Title class="text-sm font-medium">
							<a href="#sources" class="underline">Data Sources</a>
						</Card.Title>
						<DataSourceIcon />
					</Card.Header>
					<Card.Content>
						{#if network.name === 'Preview'}
							<div class="flex flex-col">
								<span class="text-md font-semibold text-muted-foreground">Unavailable</span>
								<p class="text-xs text-muted-foreground font-semibold">for this network</p>
							</div>
						{:else}
							<div class="text-2xl font-bold">{totalSources}</div>
							<span class="text-xs">
								{dexSources} DEX LPs · {cexSources} CEX APIs
							</span>
						{/if}
					</Card.Content>
				</Card.Root>
			</li>
			<li class="col-span-1 xs:col-span-2 self-center order-last sm:order-none -mt-1">
				<Card.Root class="h-fit">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-0">
						<Card.Title class="text-sm font-medium">Network Status</Card.Title>
						<SatelliteDish class="stroke-primary" size="30" />
					</Card.Header>
					<Card.Content class="mt-2">
						<div class="flex gap-3">
							<div class="w-1 bg-primary rounded-full"></div>
							<div class="w-fit">
								<a
									href={latestNetworkUpdate.link}
									target="_blank"
									class="text-sm sm:text-lg font-bold underline"
								>
									{latestNetworkUpdate.title}
								</a>

								<p class="text-xs sm:text-sm text-muted-foreground">
									{@html marked(latestNetworkUpdate.description)}
								</p>
							</div>
						</div>

						<hr class="my-4" />

						<div class="flex flex-col xs:flex-row xs:justify-between gap-2 w-full -mb-2 mt-3">
							<div class="flex gap-2 items-center">
								<PingStatus color={activeIncidents > 0 ? 'red' : 'green'} size="sm" />
								<a
									href="https://status.orcfax.io#incidents"
									target="_blank"
									class="text-xs text-muted-foreground underline"
								>
									{activeIncidents} Active Incidents
								</a>
							</div>

							<a
								href="https://status.orcfax.io/"
								target="_blank"
								class="text-xs text-muted-foreground underline">View status dashboard →</a
							>
						</div>
					</Card.Content>
				</Card.Root>
			</li>
			<li class="col-span-1 sm:self-center">
				<Card.Root class="h-full sm:h-fit col-span-1">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-0">
						<Card.Title class="text-sm font-medium">
							<a href="#nodes" class="underline">Oracle Nodes</a>
						</Card.Title>
						<NodeIcon />
					</Card.Header>
					<Card.Content>
						{#if network.name === 'Preview'}
							<div class="flex flex-col">
								<span class="text-md font-semibold text-muted-foreground">Unavailable</span>
								<p class="text-xs text-muted-foreground font-semibold">for this network</p>
							</div>
						{:else}
							<div class="text-2xl font-bold">{totalNodes}</div>
							<div class="flex items-center gap-2 self-end my-1">
								<PingStatus
									color={totalNodes === activeNodes ? 'green' : totalNodes >= 3 ? 'yellow' : 'red'}
									size="sm"
								/>
								<p class="text-xs">
									{`${activeNodes} / ${totalNodes} Active`}
								</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</li>
		</ul>
	</div>
</section>
