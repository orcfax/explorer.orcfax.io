<script lang="ts">
	import {
		differenceInDays,
		differenceInHours,
		differenceInMinutes,
		differenceInSeconds
	} from 'date-fns';
	import { time } from '$lib/stores/time';
	import { blur } from 'svelte/transition';
	import { pluralize } from '$lib/client/helpers';

	export let targetDate: Date;
	export let activeMessage: string;
	export let endMessage: string;
	export let secondaryDate: Date | undefined = undefined;
	export let secondaryActiveMessage: string | undefined = undefined;
	export let secondaryEndMessage: string | undefined = undefined;

	$time;
	$: totalSeconds = differenceInSeconds(targetDate, $time);
	$: hasDatePassed = totalSeconds <= 0 ? true : false;
	$: days = differenceInDays(targetDate, $time);
	$: hours = differenceInHours(targetDate, $time) % 24;
	$: minutes = differenceInMinutes(targetDate, $time) % 60;
	$: seconds = totalSeconds % 60;
</script>

{#if hasDatePassed && secondaryDate}
	<svelte:self
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
					<span class="text-primary font-extrabold" style={`--value:${days};`} />
				</span>
				<span class="text-base-content-100 opacity-60 text-2xl">{pluralize('day', days)}</span>
			</div>
			<div>
				<span class="countdown text-3xl">
					<span class="text-primary font-extrabold" style={`--value:${hours};`} />
				</span>
				<span class="text-base-content-100 opacity-60 text-2xl">{pluralize('hour', hours)}</span>
			</div>
			<div>
				<span class="countdown text-3xl">
					<span class="text-primary font-extrabold" style={`--value:${minutes};`} />
				</span>
				<span class="text-base-content-100 opacity-60 text-2xl">{pluralize('min', minutes)}</span>
			</div>
			<div>
				<span class="countdown text-3xl">
					<span class="text-primary font-extrabold" style={`--value:${seconds};`} />
				</span>
				<span class="text-base-content-100 opacity-60 text-2xl">{pluralize('sec', seconds)}</span>
			</div>
		</div>
	</div>
{/if}
