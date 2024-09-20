<script lang="ts">
	export let text = 'This is a scrolling text banner. ';
</script>

<div
	class="-mt-8 mb-8 relative w-screen h-10 bg-secondary text-secondary-foreground overflow-hidden whitespace-nowrap"
>
	<div class="absolute top-0 left-0 flex animate-marquee">
		<span class="px-4 py-2">{text}</span>
		<span class="px-4 py-2">{text}</span>
	</div>
</div>

<style>
	@keyframes marquee {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(-100%);
		}
	}

	.animate-marquee {
		animation: marquee 10s linear infinite;
	}
</style>
