import 'dotenv/config';
import { z } from 'zod';
import {
	type GetOrcfaxSummaryResponseDB,
	type DBFactStatement,
	type GetFactsPageResponseDB,
	DBFactStatementSchema,
	DBFeedSchema,
	type Feed,
	type DBFeed,
	type FeedLayoutData,
	type DBFeedWithData,
	PolicySchema,
	NetworkSchema,
	type Network
} from '$lib/types';
import { format, sub } from 'date-fns';
import { env } from '$env/dynamic/public';
import PocketBase, { type RecordModel } from 'pocketbase';
import { getAssetFromFeedName } from '$lib/client/helpers';
import { format as formatZonedTime, toZonedTime } from 'date-fns-tz';

// Initialize Database
const db = new PocketBase(env.PUBLIC_DB_HOST);
db.autoCancellation(false);

export async function getOrcfaxSummary(network: Network): Promise<GetOrcfaxSummaryResponseDB> {
	return {
		totalFacts: await getAllFactsCount(network),
		totalFacts24Hour: await getTodaysFactsCount(network),
		totalFeeds: await getFeedsCount(network)
	};
}

export async function getTodaysFactsCount(network: Network): Promise<number> {
	const dateFilter = format(new Date(), 'yyyy-MM-dd');

	const { totalItems } = await db.collection('facts').getList(1, 5000, {
		filter: `network = "${network.id}" && publication_date >='${dateFilter} 00:00:00.000Z'`
	});

	return totalItems;
}

export async function getAllFactsCount(network: Network): Promise<number> {
	const { totalItems } = await db
		.collection('facts')
		.getList(1, 1, { filter: `network = "${network.id}"` });
	return totalItems;
}

export async function getFactsPage(
	networkID: string,
	page: number,
	feedID: string | null
): Promise<GetFactsPageResponseDB> {
	const FACTS_PAGE_LIMIT = 5;
	const { items, totalPages, totalItems } = await db
		.collection('facts')
		.getList(page, FACTS_PAGE_LIMIT, {
			sort: '-validation_date',
			filter: `network = "${networkID}" ${feedID ? `&& feed.feed_id="${feedID}"` : ''}`,
			expand: 'feed'
		});

	const facts = validateAndParseFactStatements(items);

	return { facts, totalPages, totalFacts: totalItems };
}

export async function getFeeds(network: Network): Promise<DBFeedWithData[]> {
	try {
		const feedRecords = await db
			.collection('feeds')
			.getFullList({ filter: `network = "${network.id}"` });
		const dbFeeds = z.array(DBFeedSchema).parse(feedRecords);

		const concurrencyLimit = 2;
		const feeds: DBFeedWithData[] = [];

		// Process feeds in batches of 2
		for (let i = 0; i < dbFeeds.length; i += concurrencyLimit) {
			const batch = dbFeeds.slice(i, i + concurrencyLimit);
			const batchPromises = batch.map(async (dbFeed) => {
				const [factRecord, historicalValues] = await Promise.all([
					db.collection('facts').getList(1, 1, {
						filter: `network = "${network.id}" && feed="${dbFeed.id}"`,
						sort: '-validation_date'
					}),
					fetchHistoricalValues(network.id, dbFeed.id)
				]);

				const latestFact = DBFactStatementSchema.parse(factRecord.items[0]);
				const totalFacts = factRecord.totalItems;

				return {
					...dbFeed,
					latestFact,
					base_asset: getAssetFromFeedName(dbFeed.name, 'base'),
					quote_asset: getAssetFromFeedName(dbFeed.name, 'quote'),
					type_description: 'Current Exchange Rate',
					totalFacts,
					...historicalValues
				};
			});

			// Wait for the current batch to complete before moving to the next
			const batchResults = await Promise.all(batchPromises);
			feeds.push(...batchResults);
		}
		return feeds;
	} catch (error) {
		console.error(`Error retrieving feed records: ${error}`);
		return [];
	}
}

export async function getFeedByID(
	network: Network,
	feedID: string
): Promise<DBFeedWithData | null> {
	try {
		const feedRecord = await db
			.collection('feeds')
			.getFirstListItem(`network = "${network.id}" && feed_id~"${feedID}"`);
		const dbFeed = DBFeedSchema.parse(feedRecord);

		const [factRecord, historicalValues] = await Promise.all([
			db.collection('facts').getList(1, 1, {
				filter: `network = "${network.id}" && feed="${dbFeed.id}"`,
				sort: '-validation_date'
			}),
			fetchHistoricalValues(network.id, dbFeed.id)
		]);

		const latestFact = DBFactStatementSchema.parse(factRecord.items[0]);
		const totalFacts = factRecord.totalItems;

		return {
			...dbFeed,
			latestFact,
			base_asset: getAssetFromFeedName(dbFeed.name, 'base'),
			quote_asset: getAssetFromFeedName(dbFeed.name, 'quote'),
			type_description: 'Current Exchange Rate',
			totalFacts,
			...historicalValues
		};
	} catch (error) {
		console.error(`Error retrieving feed by ID: ${error}`);
		return null;
	}
}

export async function fetchHistoricalValues(networkID: string, feedId: string) {
	const now = new Date();
	const isoString = now.toISOString();
	const timeString = isoString.split('T')[1].slice(0, 12) + 'Z';

	const getFormattedDateFilter = (days: number) => {
		const newDate = sub(now, {
			days
		});
		return (
			formatZonedTime(toZonedTime(newDate, 'UTC'), 'yyyy-MM-dd', { timeZone: 'UTC' }) +
			' ' +
			timeString
		);
	};
	const oneDayAgoFilter = getFormattedDateFilter(1);
	const threeDaysAgoFilter = getFormattedDateFilter(3);
	const sevenDaysAgoFilter = getFormattedDateFilter(7);

	async function getNearestValue(filterDate: string) {
		try {
			const result = await db
				.collection('facts')
				.getFirstListItem(
					`network = "${networkID}" && feed="${feedId}" && validation_date <= "${filterDate}"`,
					{
						sort: '-validation_date'
					}
				);
			return result?.value;
		} catch (e) {
			return null;
		}
	}

	const [oneDayAgo, threeDaysAgo, sevenDaysAgo] = await Promise.all([
		getNearestValue(oneDayAgoFilter),
		getNearestValue(threeDaysAgoFilter),
		getNearestValue(sevenDaysAgoFilter)
	]);

	return {
		oneDayAgo,
		threeDaysAgo,
		sevenDaysAgo
	};
}

export async function getAllFeedsHistoricalValues(network: Network, feeds: DBFeedWithData[]) {
	const historicalValues = await Promise.all(
		feeds.map((feed) => fetchHistoricalValues(network.id, feed.id))
	);
	return historicalValues;
}

export async function getFeedsCount(network: Network): Promise<number> {
	const { totalItems } = await db
		.collection('feeds')
		.getList(1, 1, { filter: `network = "${network.id}"` });
	return totalItems;
}

export function validateAndParseFactStatements(facts: RecordModel[]): DBFactStatement[] {
	const factStatements = facts.map((fact) => validateAndParseFactStatement(fact));

	return factStatements;
}

export function validateAndParseFactStatement(fact: RecordModel): DBFactStatement {
	const parsedFact = DBFactStatementSchema.safeParse({
		...fact,
		feed: fact.expand?.feed ?? fact.feed
	});
	if (parsedFact.success) return parsedFact.data;
	else throw new Error(`Invalid fact: ${parsedFact.error}`);
	// TODO - better error handling
}

export async function doesFactExist(network: Network, factID?: string): Promise<boolean> {
	if (!factID) return false;
	const fact = await getFactByURN(network, factID);
	return fact !== null ? true : false;
}

export async function getFactByURN(
	network: Network,
	factURN: string
): Promise<DBFactStatement | null> {
	try {
		const record = await db
			.collection('facts')
			.getFirstListItem(`fact_urn="${factURN}"`, { expand: 'feed' });
		const fact = validateAndParseFactStatement(record);
		return fact;
	} catch (error) {
		console.error(`Error retrieving fact by URN: ${error}`);
		return null;
	}
}

export async function getFeedLayoutData(network: Network, feedID: string): Promise<FeedLayoutData> {
	const feedRecord = await db
		.collection('feeds')
		.getFirstListItem(`network = "${network.id}" && feed_id ~ "${feedID}"`);
	const feed = DBFeedSchema.parse(feedRecord);

	const [factRecord, historicalValues] = await Promise.all([
		db.collection('facts').getList(1, 1, {
			filter: `network = "${network.id}" && feed='${feed.id}'`,
			sort: '-validation_date'
		}),
		fetchHistoricalValues(network.id, feed.id)
	]);

	const latestFact = DBFactStatementSchema.parse(factRecord.items[0]);
	const totalFacts = factRecord.totalItems;

	return {
		feed: {
			...feed,
			latestFact,
			base_asset: getAssetFromFeedName(feed.name, 'base'),
			quote_asset: getAssetFromFeedName(feed.name, 'quote'),
			type_description: 'Current Exchange Rate',
			totalFacts,
			...historicalValues
		}
	};
}

export async function getFeedFactsByDateRange(
	network: Network,
	feedID: string,
	rangeOfDays: number,
	startDate: Date
): Promise<DBFactStatement[]> {
	try {
		const endDateFilter = format(
			new Date(startDate.getTime() - (rangeOfDays - 1) * 24 * 60 * 60 * 1000),
			'yyyy-MM-dd'
		);

		const { items } = await db.collection('facts').getList(1, 5000, {
			sort: '-validation_date',
			filter: `network = "${network.id}" && feed='${feedID}' && validation_date > '${endDateFilter} 00:00:00.000Z'`,
			expand: 'feed'
		});

		const parsedFacts = validateAndParseFactStatements(items);

		return parsedFacts;
	} catch (error) {
		console.error(`Error retrieving feed facts by date range: ${error}`);
		return [];
	}
}

export async function searchFactStatements(
	networkID: string,
	query: string
): Promise<DBFactStatement[]> {
	try {
		const records = await db.collection('facts').getList(1, 50, {
			filter: `network = "${networkID}" && (fact_urn ~ "${query}" || storage_urn ~ "${query}" || transaction_id ~ "${query}" || block_hash ~ "${query}")`,
			expand: 'feed'
		});
		const withExpandedFeeds = records.items.map((record) => {
			return {
				...record,
				feed: record.expand?.feed ?? record.feed
			};
		});
		const parsedFacts = z.array(DBFactStatementSchema).parse(withExpandedFeeds);

		return parsedFacts;
	} catch (error) {
		console.error(`Error retrieving fact statement records: ${error}`);
		return [];
	}
}

export async function searchFeeds(
	networkID: string,
	query: string
): Promise<Omit<Feed, 'latestFact' | 'oneDayAgo' | 'threeDaysAgo' | 'sevenDaysAgo'>[]> {
	try {
		const records = await db.collection('feeds').getList<DBFeed>(1, 50, {
			filter: `network = "${networkID}" && feed_id ~ "${query}"`
		});
		const parsedFeeds = z.array(DBFeedSchema).parse(records.items);

		return parsedFeeds.map((feed) => {
			return {
				...feed,
				base_asset: getAssetFromFeedName(feed.name, 'base'),
				quote_asset: getAssetFromFeedName(feed.name, 'quote'),
				type_description: 'Current Exchange Rate',
				totalFacts: 0 // Setting to 0 only for searching feeds
			};
		});
	} catch (error) {
		console.error(`Error retrieving feed records: ${error}`);
		return [];
	}
}

export async function getAllNetworks(): Promise<Network[]> {
	try {
		const response = await db.collection('networks').getFullList({
			expand: 'policies_via_network'
		});

		const networks: Network[] = response.map((networkRecord) => {
			const database = {
				fact_statements: `${networkRecord.name.toLowerCase()}_fact_statements`,
				feeds: `${networkRecord.name.toLowerCase()}_feeds`
			};
			const policies = networkRecord.expand?.policies_via_network
				? z
						.array(PolicySchema)
						.parse(networkRecord.expand.policies_via_network)
						.sort((a, b) => b.starting_slot - a.starting_slot)
				: [];

			return NetworkSchema.parse({
				...networkRecord,
				policies,
				database
			});
		});

		return networks;
	} catch (error) {
		console.error(`Error retrieving network records: ${error}`);
		return [];
	}
}
