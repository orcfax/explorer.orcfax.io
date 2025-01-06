<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { SatelliteDish } from 'lucide-svelte';

	interface Props {
		title: string;
		className?: string;
		children?: import('svelte').Snippet;
	}

	let { title, className = '', children }: Props = $props();
</script>

<Alert.Root class={`w-full max-w-3xl px-6 ${className}`}>
	<SatelliteDish class="stroke-primary -mt-1 -ml-1" size="30" />
	<Alert.Title class="ml-2">{title}</Alert.Title>
	<Alert.Description class="ml-2">
		{@render children?.()}
	</Alert.Description>
</Alert.Root>
