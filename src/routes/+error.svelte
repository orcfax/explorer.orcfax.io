<script>
	import { page } from '$app/stores';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';

	let heading = $page.status === 404 ? '404' : 'Error';
	let errorMessage =
		$page.error && $page.error.message.includes('Error: ')
			? 'An unknown error occurred'
			: $page.error?.message;
	let notFoundMessage =
		$page.error?.message === 'Not Found' ? 'Page not found' : $page.error?.message;
</script>

<div class="flex flex-col min-h-screen">
	<AppHeader />
	<main class="flex-grow flex items-center justify-center bg-background p-7">
		<div class="text-center space-y-2">
			<h1 class="text-5xl lg:text-9xl font-black">{heading}</h1>
			<p class="text-2xl lg:text-4xl text-muted-foreground">
				{$page.status === 404 ? notFoundMessage : errorMessage}
			</p>
			<!-- File a bug report? -->
		</div>
	</main>
	<!-- <AppFooter /> -->
</div>
