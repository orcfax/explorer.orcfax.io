<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
		extraInfo?: import('svelte').Snippet;
	}

	let { label, value, extraInfo }: Props = $props();
</script>

<div class="">
	<p>{label}:</p>
	<p>{value}</p>
	{@render extraInfo?.()}
</div>
