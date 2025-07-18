<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
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

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
</script>

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
