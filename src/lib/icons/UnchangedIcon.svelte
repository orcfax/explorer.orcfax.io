<script lang="ts">
	interface Props {
		fillColor?: string;
		height?: string;
		width?: string;
	}

	let { fillColor = 'fill-gray-600 dark:fill-gray-500', height = '20', width = '20' }: Props = $props();
</script>

<svg {height} {width} viewBox="0 0 1200 1200" class={fillColor} xmlns="http://www.w3.org/2000/svg">
	<path
		d="m850 550c17.863 0 34.371 9.5312 43.301 25 8.9336 15.469 8.9336 34.531 0 50-8.9297 15.469-25.438 25-43.301 25h-500c-17.863 0-34.371-9.5312-43.301-25-8.9336-15.469-8.9336-34.531 0-50 8.9297-15.469 25.438-25 43.301-25z"
	/>
</svg>
