<script lang="ts">
	import { Chart, getElementAtEvent } from 'svelte-chartjs';
	import 'chartjs-adapter-date-fns';
	import { Chart as ChartJS } from 'chart.js/auto';
	import {
		Title,
		Tooltip,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		TimeScale,
		type Point,
		type ChartOptions
	} from 'chart.js';
	import type { FactStatement, FeedRange } from '$lib/types';
	import { enUS } from 'date-fns/locale';
	import { format, toZonedTime } from 'date-fns-tz';
	import { mode } from 'mode-watcher';
	import { formatCurrencyValue } from '$lib/client/helpers';
	import FeedChartLoadingSkeleton from './FeedChartLoadingSkeleton.svelte';
	import { writable, type Writable } from 'svelte/store';

	export let facts: FactStatement[];
	export let selectedFact: FactStatement;
	export let onPointClick: (fact: FactStatement) => void;
	export let range: FeedRange = '1';
	export let isMobile: boolean;

	let chart: ChartJS<'line', Point[]>;

	const isLoading = writable(true);

	let primaryColor = 'hsl(174 25% 51%)';
	$: gridColor = $mode === 'dark' ? 'rgb(59, 59, 59)' : 'rgb(166, 166, 166)';
	$: labelColor = $mode === 'dark' ? 'rgb(227, 227, 222)' : 'rgb(38, 38, 38)';
	$: pointColor = 'hsl(174 25% 40%)';

	const getChartData = (fact: FactStatement, range: FeedRange, facts: FactStatement[]) => {
		return {
			datasets: [
				{
					label: 'Price Feed',
					borderColor: primaryColor,
					backgroundColor: primaryColor,
					data: facts.map((fact) => {
						return {
							x: fact.validation_date.getTime(),
							y: fact.value
						};
					}),
					pointStyle: 'circle',
					pointRadius: facts.map((f) => (f.fact_urn === fact.fact_urn ? 5 : 1.5)),
					pointBorderColor: facts.map((f) =>
						f.fact_urn === fact.fact_urn ? primaryColor : pointColor
					),
					pointBackgroundColor: facts.map((f) =>
						f.fact_urn === fact.fact_urn ? primaryColor : pointColor
					),
					pointColor: facts.map((f) => (f.fact_urn === fact.fact_urn ? primaryColor : pointColor)),
					pointHoverRadius: 5,
					pointHitRadius: 25,
					pointHoverBackgroundColor: primaryColor,
					pointHoverBorderWidth: 0,
					tension: 0.2
				}
			],
			scale: {
				x: {
					type: 'time',
					time: {
						unit: range === '1' ? 'hour' : 'day'
					}
				}
			}
		};
	};

	const getChartOptions = (
		range: FeedRange,
		isMobile: boolean,
		isLoading: Writable<boolean>
	): ChartOptions<'line'> => {
		return {
			parsing: false,
			responsive: true,
			animation: {
				onComplete: () => {
					isLoading.set(false);
				}
			},
			scales: {
				x: {
					type: 'time',
					time: {
						unit: range === '1' ? 'hour' : 'day'
					},
					title: {
						display: true,
						text: 'Validation Date',
						color: labelColor,
						font: {
							weight: 'bolder',
							size: 14
						},
						padding: { top: isMobile ? 10 : 20, bottom: isMobile ? 10 : 0 }
					},
					ticks: {
						color: labelColor
					},
					adapters: {
						date: {
							format: enUS
						}
					},
					grid: {
						display: true,
						color: gridColor
					}
				},
				y: {
					position: 'right',
					title: {
						display: true,
						text: 'Value',
						color: labelColor,
						font: {
							weight: 'bolder',
							size: 14
						},
						padding: { top: 10, bottom: 10 }
					},
					ticks: {
						color: labelColor,
						callback(tickValue) {
							const num = Number(tickValue);
							return formatCurrencyValue(num, false);
						}
					},
					grid: {
						display: true,
						color: gridColor
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					position: 'average',
					yAlign: 'bottom', // Align tooltip above the point
					xAlign: 'center', // Align tooltip to the center horizontally
					displayColors: false, // Disable the color box next to the tooltip text
					caretPadding: 10, // Space between the point and the tooltip
					padding: 10,
					borderColor: gridColor,
					borderWidth: 1,
					callbacks: {
						label: function (context) {
							const date = context.parsed.x;
							return (
								'Date: ' +
								format(toZonedTime(date, 'UTC'), 'yyyy-MM-dd HH:mm:ss zzz', {
									timeZone: 'UTC'
								})
							);
						},
						title: function (context) {
							return `Value: ${formatCurrencyValue(context[0].parsed.y, false)}`;
						}
					}
				}
			}
		};
	};

	$: data = getChartData(selectedFact, range, facts);

	$: options = getChartOptions(range, isMobile, isLoading);

	function handleChartClick(event: CustomEvent<unknown>) {
		if (event instanceof PointerEvent) {
			const element = getElementAtEvent(chart, event);
			if (!element.length) return;
			const { index } = element[0];
			onPointClick(facts[index]);
		}
	}

	ChartJS.register(
		Title,
		Tooltip,
		LineElement,
		PointElement,
		TimeScale,
		CategoryScale,
		LinearScale
	);
</script>

<!-- {#if $isLoading}
	<FeedChartLoadingSkeleton isOnlyChart />
{:else} -->
<Chart
	type="line"
	class="bg-card p-0 sm:p-6 rounded-lg border"
	bind:chart
	on:click={handleChartClick}
	{data}
	{options}
/>
<!-- {/if} -->
