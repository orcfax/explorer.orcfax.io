<script lang="ts">
	import type { Archive, FactStatement } from '$lib/types';
	import ArchiveDetails from './ArchiveDetails.svelte';
	import CollectionDetails from './CollectionDetails.svelte';
	import ValidationDetails from './ValidationDetails.svelte';
	import CalculationDetails from './CalculationDetails.svelte';
	import PublicationDetails from './PublicationDetails.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	interface Props {
		fact: FactStatement | null;
		archive: Promise<Archive> | null;
	}

	let { fact, archive }: Props = $props();
</script>

<div class="flex flex-col w-full">
	<h3 class="font-bold text-2xl">Fact <span class="hidden xxs:inline">Statement</span> Details</h3>
	<Accordion.Root class="w-full" type="multiple">
		<Accordion.Item value="collection">
			<Accordion.Trigger class="text-xl font-bold">Collection</Accordion.Trigger>
			<Accordion.Content class="flex flex-col items-center md:items-start">
				<CollectionDetails {archive} />
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="calculation">
			<Accordion.Trigger class="text-xl font-bold">Calculation</Accordion.Trigger>
			<Accordion.Content class="flex flex-col items-center md:items-start">
				<CalculationDetails {archive} />
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="validation">
			<Accordion.Trigger class="text-xl font-bold">Validation</Accordion.Trigger>
			<Accordion.Content class="flex flex-col items-center md:items-start">
				<ValidationDetails {archive} />
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="publication">
			<Accordion.Trigger class="text-xl font-bold">Publication</Accordion.Trigger>
			<Accordion.Content class="flex flex-col items-center md:items-start">
				<PublicationDetails {fact} />
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="archival">
			<Accordion.Trigger class="text-xl font-bold">Archival</Accordion.Trigger>
			<Accordion.Content class="flex flex-col items-center md:items-start">
				<ArchiveDetails {fact} />
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
