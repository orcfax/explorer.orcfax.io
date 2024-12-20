<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import FactIcon from '$lib/icons/FactIcon.svelte';
	import DataSourceIcon from '$lib/icons/DataSourceIcon.svelte';
	import type { OrcfaxStats } from '$lib/types';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import { Nfc } from 'lucide-svelte';
	import NodeIcon from '$lib/icons/NodeIcon.svelte';
	import PingStatus from '$lib/components/PingStatus.svelte';

	export let summary: OrcfaxStats;

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
						<Card.Title class="text-sm font-medium">Active Feeds</Card.Title>
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
						<Card.Title class="text-sm font-medium">Published Facts</Card.Title>
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
						<Card.Title class="text-sm font-medium">Data Sources</Card.Title>
						<DataSourceIcon />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{totalSources}</div>
						<p class="text-xs mt-1">{dexSources} DEX LPs</p>
						<p class="text-xs">{cexSources} CEX APIs</p>
					</Card.Content>
				</Card.Root>
			</li>
			<li class="col-span-1 xs:col-span-2 self-center order-last sm:order-none">
				<InfoBox title="Orcfax v1 is live on Mainnet!" className="col-span-2 h-fit self-center p-8">
					<p>
						Check out our <a
							href="https://docs.orcfax.io"
							target="_blank"
							class="text-primary underline">docs</a
						> to see what's new!
					</p>
				</InfoBox>
			</li>
			<li class="col-span-1">
				<Card.Root class="h-full col-span-1">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-0">
						<Card.Title class="text-sm font-medium">Oracle Nodes</Card.Title>
						<NodeIcon />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{totalNodes}</div>
						<div class="flex items-center gap-2 self-end my-1">
							<PingStatus
								color={totalNodes === activeNodes ? 'green' : totalNodes >= 3 ? 'yellow' : 'red'}
								size="md"
							/>
							<p class="text-xs">
								{`${activeNodes} / ${totalNodes} Active`}
							</p>
						</div>
					</Card.Content>
				</Card.Root>
			</li>
		</ul>
	</div>
</section>
