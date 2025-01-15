import { format, toZonedTime } from 'date-fns-tz';
import {
	EnvironmentSchema,
	type DBFactStatement,
	type DBFactStatementWithFeed,
	type DBFeed,
	type DBFeedWithAssets,
	type DBFeedWithData,
	type FactStatement,
	type Feed
} from '$lib/types';
import { DEFAULT_NETWORK_NAME, VALID_NETWORK_SUBDOMAINS } from '$lib/stores/network';
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export function formatFactStatementForDisplay(
	fact: DBFactStatement | DBFactStatementWithFeed,
	feed: DBFeedWithAssets
): FactStatement {
	const formatted_value = formatCurrencyValue(fact.value);
	const formatted_inverse_value = formatCurrencyValue(fact.value_inverse);

	return {
		...fact,
		fact_id: getFactIDFromUrn(fact.fact_urn),
		formatted_value,
		formatted_inverse_value,
		description: `1 ${feed.base_asset?.ticker} was ${formatted_value} ${feed.quote_asset?.ticker}`,
		inverse_description: `1 ${feed.quote_asset?.ticker} was ${formatted_inverse_value} ${feed.base_asset?.ticker}`,
		validation_date: new Date(fact.validation_date),
		validation_date_formatted: getFormattedDate(fact.validation_date),
		validation_time_formatted: getFormattedTime(fact.validation_date),
		publication_date: new Date(fact.publication_date),
		publication_date_formatted: getFormattedDate(fact.publication_date),
		publication_time_formatted: getFormattedTime(fact.publication_date),
		feed
	};
}

export function formatFeedForDisplay(feed: DBFeedWithData): Feed {
	return {
		...feed,
		latestFact: feed.latestFact ? formatFactStatementForDisplay(feed.latestFact, feed) : null
	};
}

export function formatValueForDisplay(value: number): string {
	return value.toFixed(3);
}

export function formatPercentageValue(num: number) {
	// Check if the number is close to an integer
	if (Math.abs(num - Math.round(num)) < 0.005) {
		return Math.round(num).toString();
	} else {
		return num.toFixed(2);
	}
}

export function isUUID(str: string): boolean {
	return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(
		str
	);
}

export function pluralize(text: string, number: number) {
	return number === 1 ? text : text + 's';
}

interface EllipsisOptions {
	maxLength?: number;
	placement?: 'start' | 'middle' | 'end';
}

export function ellipsis(str: string | number, options?: EllipsisOptions) {
	const maxLength = options?.maxLength || 20;
	const placement = options?.placement || 'end';

	if (typeof str === 'number') str = str.toString();

	if (str.length > maxLength) {
		if (placement === 'start') return '...' + str.slice(-maxLength);
		else if (placement === 'middle') return str.slice(0, 6) + '...' + str.slice(-6);
		else if (placement === 'end') return str.slice(0, maxLength) + '...';
	}
	return str;
}

interface FormatOptions {
	truncate?: boolean;
}

export function formatNumber(number: number, { truncate = true }: FormatOptions = {}) {
	return new Intl.NumberFormat('en-US').format(truncate ? Math.trunc(number) : number);
}

export function dateToUnixTimestamp(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number
): number {
	const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
	return Math.floor(date.getTime() / 1000);
}

export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getFactIDFromUrn(urn: string) {
	return urn.replace(/^urn:[^:]+:/, '');
}

export function getFormattedDate(date: Date) {
	return format(toZonedTime(date, 'UTC'), 'MMM do yyyy', { timeZone: 'UTC' });
}

export function getFormattedTime(date: Date) {
	return format(toZonedTime(date, 'UTC'), 'HH:mm:ss zzz', { timeZone: 'UTC' });
}

export function truncateFactValue(num: number): string {
	const numStr = num.toString();
	const [beforeDecimal, afterDecimal] = numStr.split('.');

	if (beforeDecimal.length > 3 && afterDecimal && afterDecimal.length > 3) {
		return `${beforeDecimal}.${afterDecimal.substring(0, afterDecimal.length - 4)}...`;
	}

	return numStr;
}

export function formatValue(num: number): string {
	// Define the threshold for "very small" numbers
	const SMALL_THRESHOLD = 0.000001; // 1e-6

	if (num >= SMALL_THRESHOLD) {
		// For numbers >= 0.000001, use regular formatting
		return `${num.toFixed(6)}`;
	} else {
		// For very small numbers, use the special formatting
		const str = num.toFixed(20);
		let firstNonZero = str.indexOf('1');
		if (firstNonZero === -1) firstNonZero = str.indexOf('9');

		const leadingZeros = firstNonZero - str.indexOf('.') - 1;
		const significantDigits = str.slice(firstNonZero, firstNonZero + 6);

		return `0.0₍${leadingZeros}₎${significantDigits}`;
	}
}

export function calculatePriceDifference(current: number, historical: number | undefined): number {
	if (!historical) return 0;
	return ((current - historical) / historical) * 100;
}

export function formatCurrencyValue(value: number, useSubscriptNotation = true): string {
	// Convert the number to a string using toFixed to prevent scientific notation, then slice to avoid rounding
	let valueStr = value.toFixed(20); // Using 20 decimal places to capture very small numbers accurately

	// Trim any trailing zeros
	valueStr = valueStr.replace(/\.?0+$/, '');

	// Handle large numbers by adding commas
	if (value >= 10) {
		// Split the string into integer and decimal parts
		let [integerPart, decimalPart] = valueStr.split('.');

		// Format the integer part with commas
		integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

		// If there is a decimal part and the number is >= 10, truncate it to 2 decimal places
		if (decimalPart) {
			decimalPart = decimalPart.slice(0, 2); // Slice to ensure no rounding
			return integerPart + '.' + decimalPart;
		}

		// Return the integer part if no decimal part exists
		return integerPart;
	}

	// Handle numbers between 1 and 10, keeping up to 4 decimal places
	if (value >= 1 && value < 10) {
		const decimalIndex = valueStr.indexOf('.');
		if (decimalIndex !== -1) {
			return valueStr.slice(0, decimalIndex + 5); // Slice to ensure no rounding
		}
		return valueStr; // No decimal part, return as is
	}

	// Handle numbers less than 1
	if (value < 1) {
		// If there are more than 2 leading zeros, apply special formatting
		const match = valueStr.match(/^0\.(0+)(\d+)/);
		if (match) {
			const leadingZeros = match[1].length;
			const significantDigits = match[2].slice(0, 4); // Slice to ensure no rounding

			if (leadingZeros > 2 && useSubscriptNotation) {
				// Subscript the number of leading zeros
				return `0.0<sub class="align-middle" style="font-size: 0.7em;">${leadingZeros}</sub>${significantDigits}`;
			} else {
				return `0.${match[1]}${significantDigits}`;
			}
		}

		// Otherwise, keep up to 4 decimal places
		return valueStr.slice(0, valueStr.indexOf('.') + 5); // Slice to ensure no rounding
	}

	// Default case: return the value as a string
	return valueStr;
}

export function getHeartbeatFromInterval(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const hourString = hours > 1 ? `${hours} hours` : hours === 1 ? '1 hour' : '';
	const minuteString = minutes > 1 ? `${minutes} mins` : minutes === 1 ? '1 min' : '';
	const secondString =
		remainingSeconds > 1 ? `${remainingSeconds} secs` : remainingSeconds === 1 ? '1 sec' : '';

	const result = [hourString, minuteString, secondString].filter(Boolean).join(' ');

	return result || '0 secs';
}

export function getFeedUrl(feed: DBFeedWithData | Feed | DBFeed | DBFeedWithAssets, fact_urn?: string): string {
	const feedPart = getFeedIDWithoutVersion(feed.feed_id);
	const hasFactUrn = fact_urn !== undefined || ('latestFact' in feed && feed.latestFact);
	const factPart = fact_urn
		? fact_urn.slice(11)
		: 'latestFact' in feed && feed.latestFact
			? feed.latestFact.fact_urn.slice(11)
			: null;

	const url = hasFactUrn ? `/feeds/${feedPart}/facts/${factPart}` : `/feeds/${feedPart}/facts`;

	return url;
}

export function getFeedIDWithoutVersion(feed_id: string): string {
	return feed_id.replace(/\/\d+$/, '');
}

export function toTitleCase(str: string): string {
	return str.replace(
		/\w\S*/g,
		(txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
	);
}

export function getCleanStatusUrl(): string {
	const appSubdomains = {
		production: 'status.',
		test: 'status-test.',
		development: ''
	};

	if (!env.PUBLIC_NODE_ENV || !env.PUBLIC_BASE_URL) error(500, 'Missing environment variables');
	const environment = EnvironmentSchema.parse(env.PUBLIC_NODE_ENV);

	return new URL(
		`${environment === 'development' ? 'http://' : 'https://'}${appSubdomains[environment]}${env.PUBLIC_BASE_URL}`
	).toString();
}

export function getNetworkUrl(url: string, networkName: string): string {
	const newUrl = new URL(url);

	// Get the app subdomain based on the environment
	const appSubdomains = {
		production: 'explorer.',
		test: 'explorer-test.',
		development: ''
	};
	if (!env.PUBLIC_NODE_ENV || !env.PUBLIC_BASE_URL) error(500, 'Missing environment variables');
	const environment = EnvironmentSchema.parse(env.PUBLIC_NODE_ENV);
	const appPart = appSubdomains[environment];

	// Get the network subdomain based on the network name
	const network = networkName.toLowerCase();
	const defaultNetwork = DEFAULT_NETWORK_NAME.toLowerCase();
	const networkSubdomain = VALID_NETWORK_SUBDOMAINS.includes(network) ? network : defaultNetwork;
	const networkPart = networkSubdomain === defaultNetwork ? '' : `${networkSubdomain}.`;

	// Build the new URL
	newUrl.search = '';
	newUrl.hash = '';
	newUrl.hostname = `${networkPart}${appPart}${env.PUBLIC_BASE_URL}${newUrl.pathname}`;

	return newUrl.toString();
}

export function formatSumValue(num: number): string {
	return num.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}

export function getXerberusRiskDescription(risk: string): string {
	const investmentGrade = ['AAA', 'AA', 'A'];
	const speculativeGrade = ['BBB', 'BB', 'B'];
	const highlySpeculativeGrade = ['CCC', 'CC', 'C'];
	const junkGrade = ['D'];

	if (investmentGrade.includes(risk)) {
		return 'Investment Grade';
	} else if (speculativeGrade.includes(risk)) {
		return 'Speculative Grade';
	} else if (highlySpeculativeGrade.includes(risk)) {
		return 'Highly Speculative Grade';
	} else if (junkGrade.includes(risk)) {
		return 'Junk Grade';
	} else {
		return 'Unknown';
	}
}
