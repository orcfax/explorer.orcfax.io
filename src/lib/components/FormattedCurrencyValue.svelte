<script lang="ts">
	import { formatCurrencyValue } from '$lib/client/helpers';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement> & {
		value: number;
	};

	interface Props {
		value: $$Props['value'];
		class?: $$Props['class'];
	}

	let { value, class: className = undefined }: Props = $props();
</script>

<span class={`whitespace-nowrap ${className}`}>
	{@html formatCurrencyValue(value)}
</span>
