<script lang="ts">
	export let label: string;
	export let value: string | number;
</script>

<div class="">
	<p>{label}:</p>
	<p>{value}</p>
	<slot name="extraInfo" />
</div>
