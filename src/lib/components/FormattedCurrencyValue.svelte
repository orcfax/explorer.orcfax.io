<script lang="ts">
	import { formatCurrencyValue } from '$lib/client/helpers';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement> & {
		value: number;
	};

	export let value: $$Props['value'];
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span class={`whitespace-nowrap ${className}`}>
	{@html formatCurrencyValue(value)}
</span>
