<script lang="ts">
	interface Props {
		fillColor?: string;
		height?: string;
		width?: string;
	}

	let {
		fillColor = 'fill-red-600 dark:fill-red-500',
		height = '20',
		width = '20'
	}: Props = $props();
</script>

<svg {height} {width} viewBox="0 0 1200 1200" class={fillColor} xmlns="http://www.w3.org/2000/svg">
	<path
		d="m860.53 528.84-219.24 220.31c-11.344 10.219-26.016 15.938-41.297 16.078-14.578-0.046874-28.547-5.8125-38.859-16.078l-219-220.31c-16.875-15.094-22.266-39.188-13.453-60 8.625-20.625 28.781-34.078 51.094-34.219h440.16c22.125 0.375 42 13.641 50.719 33.938 8.7656 20.297 4.7812 43.828-10.125 60.141z"
		fill-rule="evenodd"
	/>
</svg>
