<script lang="ts">
	import 'chartjs-adapter-date-fns';
	import {
		Chart,
		Title,
		Tooltip,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		TimeScale,
		type ChartOptions,
		type TooltipItem
	} from 'chart.js/auto';
	import { onMount, onDestroy } from 'svelte';
	import type { FactStatement, FeedRange } from '$lib/types';
	import { enUS } from 'date-fns/locale';
	import { format, toZonedTime } from 'date-fns-tz';
	import { mode } from 'mode-watcher';
	import { formatCurrencyValue } from '$lib/client/helpers';

	interface Props {
		facts: FactStatement[];
		selectedFact: FactStatement;
		onPointClick: (fact: FactStatement) => void;
		range?: FeedRange;
		isMobile: boolean;
	}

	let { facts, selectedFact, onPointClick, range = '1', isMobile }: Props = $props();

	let element: HTMLCanvasElement | null = $state(null);
	let chart: Chart | null = $state(null);

	let primaryColor = $state('hsl(174 25% 51%)');
	let gridColor = $derived($mode === 'dark' ? 'rgb(59, 59, 59)' : 'rgb(166, 166, 166)');
	let labelColor = $derived($mode === 'dark' ? 'rgb(227, 227, 222)' : 'rgb(38, 38, 38)');
	let pointColor = $state('hsl(174 25% 40%)');
	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let omitLabels = $derived(innerWidth < 400);

	let data = $derived.by(() => {
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
					pointRadius: facts.map((f) => (f.fact_urn === selectedFact.fact_urn ? 5 : 1.5)),
					pointBorderColor: facts.map((f) =>
						f.fact_urn === selectedFact.fact_urn ? primaryColor : pointColor
					),
					pointBackgroundColor: facts.map((f) =>
						f.fact_urn === selectedFact.fact_urn ? primaryColor : pointColor
					),
					pointColor: facts.map((f) =>
						f.fact_urn === selectedFact.fact_urn ? primaryColor : pointColor
					),
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
	});
	let options: ChartOptions<'line'> = $derived.by(() => {
		return {
			parsing: false,
			responsive: true,
			scales: {
				x: {
					type: 'time',
					time: {
						unit: range === '1' ? 'hour' : 'day'
					},
					title: {
						display: !omitLabels,
						text: 'Validation Date',
						color: labelColor,
						font: {
							weight: 'bolder',
							size: 14
						},
						padding: { top: isMobile ? 10 : 20, bottom: isMobile ? 10 : 0 }
					},
					ticks: {
						display: !omitLabels,
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
					type: 'linear',
					position: 'right',
					title: {
						display: !omitLabels,
						text: 'Value',
						color: labelColor,
						font: {
							weight: 'bolder',
							size: 14
						},
						padding: { top: 10, bottom: 10 }
					},
					ticks: {
						display: !omitLabels,
						color: labelColor,
						callback(tickValue: unknown) {
							return formatCurrencyValue(Number(tickValue), false);
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
						label: function (context: TooltipItem<'line'>) {
							const date = context.parsed.x;
							return (
								'Date: ' +
								format(toZonedTime(date, 'UTC'), 'yyyy-MM-dd HH:mm:ss zzz', {
									timeZone: 'UTC'
								})
							);
						},
						title: function (context: TooltipItem<'line'>[]) {
							return `Value: ${formatCurrencyValue(context[0].parsed.y, false)}`;
						}
					}
				}
			}
		};
	});

	onMount(() => {
		if (element === null) {
			console.error('Chart element is not set');
			return;
		}

		chart = new Chart(element, {
			type: 'line',
			data,
			options
		});
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});

	function handleChartClick(event: MouseEvent) {
		if (!chart) return;
		const element = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
		if (!element.length) return;
		const { index } = element[0];
		onPointClick(facts[index]);
	}

	Chart.register(Title, Tooltip, LineElement, PointElement, TimeScale, CategoryScale, LinearScale);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<canvas bind:this={element} class="bg-card p-0 sm:p-6 rounded-lg border" onclick={handleChartClick}>
</canvas>
