import { format, toZonedTime } from 'date-fns-tz';
import {
	EnvironmentSchema,
	type Asset,
	type DBFactStatement,
	type DBFeed,
	type DBFeedWithData,
	type FactStatement,
	type Feed
} from '$lib/types';
import { DEFAULT_NETWORK_NAME, VALID_NETWORK_SUBDOMAINS } from '$lib/stores/network';
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export function formatFactStatementsForDisplay(
	facts: DBFactStatement[],
	feed?: DBFeed
): (FactStatement & { feed: DBFeed })[] {
	return facts.map((fact) => formatFactStatementForDisplay(fact, feed));
}

export function formatFactStatementForDisplay(
	fact: DBFactStatement,
	feed?: DBFeed
): FactStatement & { feed: DBFeed } {
	const feedData = typeof fact.feed === 'string' ? feed : fact.feed;
	if (!feedData) {
		throw new Error('Feed is required to format a fact statement for display');
	}

	// TODO create a class to handle different feed types and their conversion logic for values
	const formatted_value = formatCurrencyValue(fact.value);
	const formatted_inverse_value = formatCurrencyValue(fact.value_inverse);
	const feedName = feedData.name;
	const baseAsset = getAssetFromFeedName(feedName, 'base');
	const quoteAsset = getAssetFromFeedName(feedName, 'quote');

	return {
		...fact,
		fact_id: getFactIDFromUrn(fact.fact_urn),
		formatted_value,
		formatted_inverse_value,
		description: `1 ${baseAsset.ticker} was ${formatted_value} ${quoteAsset.ticker}`,
		inverse_description: `1 ${quoteAsset.ticker} was ${formatted_inverse_value} ${baseAsset.ticker}`,
		validation_date: new Date(fact.validation_date),
		validation_date_formatted: getFormattedDate(fact.validation_date),
		validation_time_formatted: getFormattedTime(fact.validation_date),
		publication_date: new Date(fact.publication_date),
		publication_date_formatted: getFormattedDate(fact.publication_date),
		publication_time_formatted: getFormattedTime(fact.publication_date),
		feed: feedData
	};
}

export function formatFeedForDisplay(feed: DBFeedWithData): Feed {
	return {
		...feed,
		latestFact: formatFactStatementForDisplay(feed.latestFact, feed)
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

export function getAssetFromFeedName(feedName: string, type: 'base' | 'quote'): Asset {
	const assets: Asset[] = [
		{ ticker: 'ADA', name: 'Cardano', url: 'https://cardano.org/', image: '/assets/ada.png' },
		{
			ticker: 'DJED',
			name: 'Djed Stablecoin',
			url: 'https://djed.xyz/',
			image: '/assets/djed.png'
		},
		{ ticker: 'FACT', name: 'Orcfax', url: 'https://orcfax.io/', image: '/assets/fact.png' },
		{
			ticker: 'HUNT',
			name: 'DexHunter',
			url: 'https://www.dexhunter.io/',
			image: '/assets/hunt.png'
		},
		{
			ticker: 'iBTC',
			name: 'Indigo - Bitcoin',
			url: 'https://indigoprotocol.io/',
			image: '/assets/ibtc.png'
		},
		{
			ticker: 'iETH',
			name: 'Indigo - Ethereum',
			url: 'https://indigoprotocol.io/',
			image: '/assets/ieth.png'
		},
		{
			ticker: 'iUSD',
			name: 'Indigo - U.S. Dollar',
			url: 'https://indigoprotocol.io/',
			image: '/assets/iusd.png'
		},
		{ ticker: 'LENFI', name: 'Lenfi', url: 'https://lenfi.io/', image: '/assets/lenfi.png' },
		{ ticker: 'LQ', name: 'Liqwid', url: 'https://liqwid.finance/', image: '/assets/lq.png' },
		{
			ticker: 'NEWM',
			name: 'NEWM',
			url: 'https://newm.io/',
			image: '/assets/newm.png',
			backgroundColor: '#000000'
		},
		{
			ticker: 'SHEN',
			name: 'Shen Reservecoin',
			url: 'https://djed.xyz/',
			image: '/assets/shen.png'
		},
		{
			ticker: 'USD',
			name: 'U.S. Dollar',
			url: 'https://www.usa.gov/currency',
			image: '/assets/usd.png'
		},
		{
			ticker: 'WMT',
			name: 'World Mobile Token',
			url: 'https://worldmobiletoken.com/',
			image: '/assets/wmt.png'
		},
		{
			ticker: 'USDM',
			name: 'Moneta Stablecoin',
			url: 'https://moneta.global/',
			image: '/assets/usdm.png',
			backgroundColor: '#1A56FF'
		},
		{
			ticker: 'SNEK',
			name: 'Snek Memecoin',
			url: 'https://www.snek.com/',
			image: '/assets/snek.png'
		},
		{
			ticker: 'MIN',
			name: 'Minswap',
			url: 'https://minswap.org/',
			image: '/assets/min.webp'
		},
		{
			ticker: 'EUR',
			name: 'E.U. Euro',
			url: 'https://www.ecb.europa.eu/euro/',
			image: '/assets/eur.png'
		},
		{
			ticker: 'CERRA',
			name: 'Cerra',
			url: 'https://cerra.io/',
			image: '/assets/cerra.webp'
		},
		{
			ticker: 'AGIX',
			name: 'Singularity Net',
			url: 'https://singularitynet.io/',
			image: '/assets/agix.png'
		},
		{
			ticker: 'BTN',
			name: 'Butane',
			url: 'https://butane.dev/',
			image: '/assets/btn.png',
			backgroundColor: '#070216'
		},
		{
			ticker: 'BTC',
			name: 'Bitcoin',
			url: 'https://bitcoin.org/en/',
			image: '/assets/btc.png'
		},
		{
			ticker: 'INDY',
			name: 'Indigo',
			url: 'https://indigoprotocol.io/',
			image: '/assets/indy.png'
		},
		{
			ticker: 'BOOK',
			name: 'Book',
			url: 'https://book.io/',
			image: '/assets/book.png',
			backgroundColor: '#E6E6E6'
		},
		{
			ticker: 'COPI',
			name: 'Cornicopias',
			url: 'https://cornucopias.io/',
			image: '/assets/copi.png',
			backgroundColor: '#050607'
		},
		{
			ticker: 'HOSKY',
			name: 'Hosky',
			url: 'https://hosky.io',
			image: '/assets/hosky.png',
			backgroundColor: '#216DD2'
		}
	];

	const ticker = feedName.split('-')[type === 'base' ? 0 : 1];

	return assets.find((asset) => asset.ticker === ticker) || { ticker };
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

export function getFeedUrl(feed: DBFeedWithData | Feed | DBFeed, fact_urn?: string): string {
	const feedPart = getFeedIDWithoutVersion(feed.feed_id);
	const hasFactUrn = fact_urn !== undefined || 'latestFact' in feed;
	const factPart = fact_urn
		? fact_urn.slice(11)
		: 'latestFact' in feed
			? feed.latestFact.fact_urn.slice(11)
			: null;

	return hasFactUrn ? `/feeds/${feedPart}/facts/${factPart}` : `/feeds/${feedPart}/facts`;
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
