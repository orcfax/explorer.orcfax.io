<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { time } from '$lib/stores/time';
	import { ModeWatcher } from 'mode-watcher';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { networkStore } from '$lib/stores/network';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';

	export let data;

	$time;
	$: networkStore.set({ network: data.network, networks: data.networks });

	const STALE_THRESHOLD_MS = 60_000;

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: STALE_THRESHOLD_MS
			}
		}
	});

	onMount(() => {
		let hiddenAt: number | null = null;

		function onVisibilityChange() {
			if (document.hidden) {
				hiddenAt = Date.now();
			} else if (hiddenAt) {
				if (Date.now() - hiddenAt > STALE_THRESHOLD_MS) {
					invalidate('app:live-data');
				}
				hiddenAt = null;
			}
		}

		document.addEventListener('visibilitychange', onVisibilityChange);
		return () => document.removeEventListener('visibilitychange', onVisibilityChange);
	});
</script>

<!-- Setup Privacy-preserving Umami Analytics -->
<svelte:head>
	<script
		defer
		src="https://analytics.server.orcfax.io/script.js"
		data-website-id="2893e760-f276-4034-bbb8-a21bfd731486"
	></script>
</svelte:head>

<QueryClientProvider client={queryClient}>
	<ModeWatcher />
	<div class="flex flex-col w-full h-full min-h-full">
		<AppHeader />
		<div class="bg-background mb-14 mt-[100px] xxxs:mt-[120px] relative">
			<slot />
		</div>
		<AppFooter />
	</div>
	<SvelteQueryDevtools />
</QueryClientProvider>
