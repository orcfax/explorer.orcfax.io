<script lang="ts">
	import Countdown from './Countdown.svelte';
	import {
		differenceInDays,
		differenceInHours,
		differenceInMinutes,
		differenceInSeconds
	} from 'date-fns';
	import { time } from '$lib/stores/time';
	import { blur } from 'svelte/transition';
	import { pluralize } from '$lib/client/helpers';

	interface Props {
		targetDate: Date;
		activeMessage: string;
		endMessage: string;
		secondaryDate?: Date | undefined;
		secondaryActiveMessage?: string | undefined;
		secondaryEndMessage?: string | undefined;
	}

	let {
		targetDate,
		activeMessage,
		endMessage,
		secondaryDate = undefined,
		secondaryActiveMessage = undefined,
		secondaryEndMessage = undefined
	}: Props = $props();

	$time;
	let totalSeconds = $derived(differenceInSeconds(targetDate, $time));
	let hasDatePassed = $derived(totalSeconds <= 0 ? true : false);
	let days = $derived(differenceInDays(targetDate, $time));
	let hours = $derived(differenceInHours(targetDate, $time) % 24);
	let minutes = $derived(differenceInMinutes(targetDate, $time) % 60);
	let seconds = $derived(totalSeconds % 60);
</script>

{#if hasDatePassed && secondaryDate}
	<Countdown
		targetDate={secondaryDate}
		activeMessage={secondaryActiveMessage}
		endMessage={secondaryEndMessage}
	/>
{:else if hasDatePassed}
	<div class="text-3xl text-primary font-bold text-center" transition:blur>
		{endMessage}
	</div>
{:else}
	<div class="flex flex-col gap-4 sm:gap-2 justify-center" transition:blur>
		<p class="text-base-100-content opacity-80 font-bold text-2xl text-center">
			{activeMessage}
		</p>
		<div class="flex gap-5 font-semibold">
			<div>
				<span class="countdown text-3xl">
					<span class="text-primary font-extrabold" style={`--value:${days};`}></span>
				</span>
				<span class="text-base-content-100 opacity-60 text-2xl">{pluralize('day', days)}</span>
			</div>
			<div>
				<span class="countdown text-3xl">
					<span class="text-primary font-extrabold" style={`--value:${hours};`}></span>
				</span>
				<span class="text-base-content-100 opacity-60 text-2xl">{pluralize('hour', hours)}</span>
			</div>
			<div>
				<span class="countdown text-3xl">
					<span class="text-primary font-extrabold" style={`--value:${minutes};`}></span>
				</span>
				<span class="text-base-content-100 opacity-60 text-2xl">{pluralize('min', minutes)}</span>
			</div>
			<div>
				<span class="countdown text-3xl">
					<span class="text-primary font-extrabold" style={`--value:${seconds};`}></span>
				</span>
				<span class="text-base-content-100 opacity-60 text-2xl">{pluralize('sec', seconds)}</span>
			</div>
		</div>
	</div>
{/if}
