<script lang="ts">
	import { getCleanStatusUrl } from '$lib/client/helpers';
	import DiscordIcon from '$lib/icons/DiscordIcon.svelte';
	import GithubIcon from '$lib/icons/GithubIcon.svelte';
	import MediumIcon from '$lib/icons/MediumIcon.svelte';
	import OpenLink from '$lib/icons/OpenLink.svelte';
	import TwitterIcon from '$lib/icons/TwitterIcon.svelte';
	import orcfaxLogo from '$lib/images/orcfax_logo.png';
</script>

<footer
	class="flex flex-col bg-section md:flex-row justify-between items-center w-full p-3 border-t"
>
	<div class="flex items-center gap-2">
		<a href="https://orcfax.io">
			<img class="w-12 bg-primary rounded-full" src={orcfaxLogo} alt="Orcfax Logo" />
		</a>

		<p class="text-sm font-medium">Copyright © Orcfax Ltd. 2024</p>
	</div>

	<div class="flex flex-col xs:flex-row items-center justify-center gap-4">
		<div class="flex gap-4">
			<a class="flex items-center gap-1 hover:underline" href={getCleanStatusUrl()} target="_blank">
				<p class="text-lg font-semibold">Status</p>
				<OpenLink />
			</a>

			<a
				class="flex items-center gap-1 hover:underline"
				href="https://docs.orcfax.io"
				target="_blank"
			>
				<p class="text-lg font-semibold">Docs</p>
				<OpenLink />
			</a>
		</div>
		<div class="flex gap-4 pr-2">
			<a href="https://discord.com/invite/UbAeRuNzDu" target="_blank">
				<DiscordIcon width={'30'} height={'30'} />
			</a>
			<a href="https://twitter.com/orcfax" target="_blank">
				<TwitterIcon width={'30'} height={'30'} />
			</a>
			<a href="https://medium.com/@orcfax" target="_blank">
				<MediumIcon width={'30'} height={'30'} />
			</a>
			<a href="https://github.com/orcfax" target="_blank">
				<GithubIcon width={'30'} height={'30'} />
			</a>
		</div>
	</div>
</footer>
