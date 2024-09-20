<script lang="ts">
	import { getCleanStatusUrl } from '$lib/client/helpers';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { EllipsisVertical } from 'lucide-svelte';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<EllipsisVertical />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<a href="https://orcfax.io/" target="_blank" rel="noreferrer">
				<DropdownMenu.Item>Main Site</DropdownMenu.Item>
			</a>

			<a href="https://docs.orcfax.io/" target="_blank" rel="noreferrer">
				<DropdownMenu.Item>Docs</DropdownMenu.Item>
			</a>

			<a href={getCleanStatusUrl()} target="_blank" rel="noreferrer">
				<DropdownMenu.Item>Status</DropdownMenu.Item>
			</a>

			<a href="https://discord.gg/7vzr3Y9" target="_blank" rel="noreferrer">
				<DropdownMenu.Item>Discord</DropdownMenu.Item>
			</a>

			<a href="https://github.com/orcfax" target="_blank" rel="noreferrer">
				<DropdownMenu.Item>GitHub</DropdownMenu.Item>
			</a>

			<a href="https://medium.com/@orcfax" target="_blank" rel="noreferrer">
				<DropdownMenu.Item>Medium</DropdownMenu.Item>
			</a>

			<a href="https://x.com/orcfax" target="_blank" rel="noreferrer">
				<DropdownMenu.Item>X</DropdownMenu.Item>
			</a>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
