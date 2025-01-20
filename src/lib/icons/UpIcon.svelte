<script lang="ts">
	interface Props {
		fillColor?: string;
		height?: string;
		width?: string;
	}

	let {
		fillColor = 'fill-green-600 dark:fill-green-500',
		height = '20',
		width = '20'
	}: Props = $props();
</script>

<svg {height} {width} viewBox="0 0 1200 1200" class={fillColor} xmlns="http://www.w3.org/2000/svg">
	<path
		d="m340.92 671.16 219.24-219.94c10.969-10.312 25.406-16.172 40.453-16.453 14.719-0.09375 28.875 5.8594 39.094 16.453l219.61 219.94c15.797 15.703 20.531 39.422 12 60-8.1094 20.859-28.406 34.359-50.766 33.844h-440.48c-22.359 0.09375-42.516-13.312-51.094-33.938-8.5781-20.625-3.8438-44.391 11.953-60.141z"
		fill-rule="evenodd"
	/>
</svg>
