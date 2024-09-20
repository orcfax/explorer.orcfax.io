<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import { browser } from '$app/environment';
	import * as Command from '$lib/components/ui/command';
	import Search from '$lib/icons/Search.svelte';
	import type { DBFactStatement, Feed } from '$lib/types';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import FeedNameplate from './FeedNameplate.svelte';
	import { goto } from '$app/navigation';
	import { getFeedUrl } from '$lib/client/helpers';
	import { networkStore } from '$lib/stores/network';

	let isOpen = false;
	let metaKey: '⌘' | 'Ctrl';
	let query = '';
	let isLoading = false;
	let debounceTimer: ReturnType<typeof setTimeout>;
	let results = writable<{ factStatements: DBFactStatement[]; feeds: Feed[] }>({
		factStatements: [],
		feeds: []
	});

	onMount(() => {
		metaKey = browser && window.navigator.userAgent.includes('Macintosh') ? '⌘' : 'Ctrl';

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				isOpen = !isOpen;
			}
		}

		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	async function onSelectItem(item: DBFactStatement | Feed) {
		isLoading = true;
		if ('fact_urn' in item) {
			if (typeof item.feed === 'string') {
				isOpen = false;
				isLoading = false;
				throw new Error('Full feed object is required');
			} else await goto(getFeedUrl(item.feed, item.fact_urn));
		} else {
			await goto(getFeedUrl(item));
		}
		isOpen = false;
		isLoading = false;
	}

	async function handleSearch(query: string): Promise<void> {
		if (!query) {
			if ($results.factStatements.length > 0 || $results.feeds.length > 0) {
				results.set({ factStatements: [], feeds: [] });
			}
			isLoading = false;
			return;
		}

		try {
			const res = await fetch(
				`/api/search?network=${$networkStore.network.id}&q=${encodeURIComponent(query)}`
			);
			const data = await res.json();
			if (res.ok) {
				results.set(data);
			} else {
				console.error('Search error:', data.error);
				results.set({ factStatements: [], feeds: [] });
			}
		} catch (error) {
			console.error('Search request failed:', error);
			results.set({ factStatements: [], feeds: [] });
		} finally {
			isLoading = false;
		}
	}

	const debouncedSearch = async (query: string) => {
		clearTimeout(debounceTimer);
		isLoading = true;
		debounceTimer = setTimeout(async () => {
			await handleSearch(query);
			isLoading = false;
		}, 750);
	};

	$: debouncedSearch(query);
</script>

<button
	type="button"
	on:click={() => (isOpen = true)}
	class="flex h-10 w-fit space-x-1 rounded-md border border-input bg-background px-[10px] xxs:px-3 py-2 justify-center text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
>
	<Search width="20" height="20" />
	<div class="hidden sm:flex space-x-2 text-sm text-muted-foreground">
		{#if metaKey}
			<kbd
				class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
			>
				<span class="text-xs">{metaKey}</span>K
			</kbd>
			<span>to search</span>
		{:else}
			<span>Search</span>
		{/if}
	</div>
	<div class="hidden text-sm xxs:flex sm:hidden text-muted-foreground">Tap to search</div>
</button>

<Command.Dialog bind:open={isOpen} loop>
	<Command.Input placeholder="Search Orcfax..." bind:value={query} />
	{#if isLoading}
		<Command.Loading asChild>
			<Loading class="min-h-[300px]" />
		</Command.Loading>
	{:else}
		{#await $results}
			<Command.Loading asChild>
				<Loading class="min-h-[300px]" />
			</Command.Loading>
		{:then data}
			<Command.Empty>No results found</Command.Empty>
			{#if data && (data.factStatements.length > 0 || data.feeds.length > 0)}
				<Command.List>
					<Command.Group heading="Fact Statements">
						{#each data.factStatements as item}
							<Command.Item
								class="cursor-pointer"
								onSelect={(_) => onSelectItem(item)}
								value={item.fact_urn}
							>
								{item.fact_urn}
							</Command.Item>
						{/each}
					</Command.Group>
					<Command.Group heading="Feeds">
						{#each data.feeds as item}
							<Command.Item
								class="cursor-pointer"
								onSelect={(_) => onSelectItem(item)}
								value={getFeedUrl(item)}
							>
								<FeedNameplate feed={item} size="md" label="typeAndName" />
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			{/if}
		{:catch error}
			<Command.Empty>{error.message}</Command.Empty>
		{/await}
	{/if}
</Command.Dialog>
