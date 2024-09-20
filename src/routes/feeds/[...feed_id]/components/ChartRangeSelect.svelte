<script lang="ts">
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';

	export let onChange: (value: string | undefined) => void;
	export let value: string | undefined = '1';
</script>

<ToggleGroup.Root
	bind:value
	onValueChange={(value) => {
		if (value) onChange(value);
	}}
	type="single"
	class={`border rounded-lg ${$$restProps.class}`}
>
	<ToggleGroup.Item
		class={`bg-section hover:bg-card hover:text-card-foreground`}
		value="1"
		disabled={value === '1'}
		aria-label="Toggle 1 day"
		style={value === '1'
			? 'background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); opacity: 1;'
			: ''}
	>
		<div>1D</div>
	</ToggleGroup.Item>
	<ToggleGroup.Item
		class={`bg-section hover:bg-card hover:text-card-foreground`}
		value="3"
		disabled={value === '3'}
		aria-label="Toggle 3 days"
		style={value === '3'
			? 'background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); opacity: 1;'
			: ''}
	>
		<div>3D</div>
	</ToggleGroup.Item>
	<ToggleGroup.Item
		class={`bg-section hover:bg-card hover:text-card-foreground`}
		value="7"
		disabled={value === '7'}
		aria-label="Toggle 7 days"
		style={value === '7'
			? 'background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); opacity: 1;'
			: ''}
	>
		<div>7D</div>
	</ToggleGroup.Item>
</ToggleGroup.Root>
