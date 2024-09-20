<script lang="ts">
	import orcfaxLogo from '$lib/images/orcfax_logo.png';
	import NetworkSelect from './NetworkSelect.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import CommandSearch from './CommandSearch.svelte';
	import LinkMenu from './LinkMenu.svelte';
</script>

<header class="w-full bg-section fixed top-0 left-0 z-50 overflow-hidden">
	<div class="flex items-center justify-between p-0 sm:flex-row sm:p-1">
		<a class="flex h-fit normal-case gap-0" href="/">
			<img
				class="w-[75px] lg:w-20 transform transition ease-in-out duration-300 delay-150 hover:-rotate-45"
				src={orcfaxLogo}
				alt="The Orcfax mascot and logo, Echo."
			/>
			<div class="flex-col pl-5">
				<h2 class="text-secondary-foreground text-3xl font-bold mt-2 -ml-7">Orcfax</h2>
				<h3 class="water-reflection-text text-2xl font-extrabold -mt-3 pl-0 lg:pl-2 text-primary">
					explorer
				</h3>
			</div>
		</a>
		<div class="flex h-full space-x-4 mr-4">
			<CommandSearch />
			<NetworkSelect />
			<ThemeToggle />
			<LinkMenu />
		</div>
	</div>
	<Separator decorative />
</header>
