import 'dotenv/config';
import { z } from 'zod';
import {
	type DBFactStatement,
	type GetFactsPageResponseDB,
	DBFactStatementSchema,
	type Feed,
	type DBFeedWithData,
	type Network,
	NetworkSchema,
	PolicySchema,
	DBFeedWithAssetsSchema,
	DBFactStatementWithFeedSchema,
	type DBFactStatementWithFeed,
	type NodeWithMetadata,
	type SourceWithMetadata,
	DBFeedWithDataSchema,
	type NetworkSummary,
	NetworkSummarySchema,
	NodeWithMetadataSchema,
	SourceWithMetadataSchema
} from '$lib/types';
import { format, sub } from 'date-fns';
import { format as formatZonedTime, toZonedTime } from 'date-fns-tz';
import { error } from '@sveltejs/kit';
import { logError } from '$lib/server/logger';
import type PocketBase from 'pocketbase';

export async function getFactsPage(
	db: PocketBase,
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
			expand: 'feed.base_asset,feed.quote_asset,participating_nodes'
		});

	const facts = items.map((item) => {
		if (!item.expand?.feed) error(500, 'Fact is missing feed');
		const parsedFact = DBFactStatementWithFeedSchema.safeParse({
			...item,
			feed: {
				...item.expand.feed,
				base_asset: item.expand.feed.expand.base_asset,
				quote_asset: item.expand.feed.expand.quote_asset
			},
			participating_nodes: item.expand?.participating_nodes
		});
		if (parsedFact.success) return parsedFact.data;
		else error(500, `Invalid fact: ${parsedFact.error}`);
	});

	return { facts, totalPages, totalFacts: totalItems };
}

export async function getFeeds(pb: PocketBase, network: Network): Promise<DBFeedWithData[]> {
	try {
		const data = await pb.send(`/api/explorer/feeds/${network.id}`, {});
		const feeds = z.array(DBFeedWithDataSchema).parse(data);

		return feeds;
	} catch (error) {
		await logError(`Error retrieving feed records`, error);
		return [];
	}
}

export async function getFeedByID(
	db: PocketBase,
	network: Network,
	feedID: string
): Promise<DBFeedWithData | null> {
	try {
		const feedIDParsed = feedID.replace(/\/facts\/undefined$/, '');
		const feedResponse = await db
			.collection('feeds')
			.getFirstListItem(`network = "${network.id}" && feed_id~"${feedIDParsed}"`, {
				expand: 'base_asset,quote_asset'
			});

		const dbFeed = DBFeedWithAssetsSchema.parse({
			...feedResponse,
			base_asset: feedResponse.expand?.base_asset,
			quote_asset: feedResponse.expand?.quote_asset
		});

		const [factRecord, historicalValues] = await Promise.all([
			db.collection('facts').getList(1, 1, {
				filter: `network = "${network.id}" && feed="${dbFeed.id}"`,
				sort: '-validation_date',
				expand: 'feed.base_asset,feed.quote_asset'
			}),
			fetchHistoricalValues(db, network.id, dbFeed.id)
		]);

		const latestFact = factRecord.items[0]
			? DBFactStatementSchema.parse(factRecord.items[0])
			: null;
		const totalFacts = factRecord.totalItems;

		return {
			...dbFeed,
			latestFact,
			type_description: 'Current Exchange Rate',
			type_description_short: 'CER',
			totalFacts,
			...historicalValues
		};
	} catch (error) {
		await logError(`Error retrieving feed by ID`, error);
		return null;
	}
}

export async function fetchHistoricalValues(db: PocketBase, networkID: string, feedId: string) {
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

export async function getFactByURN(
	db: PocketBase,
	network: Network,
	factURN: string,
	filters = ''
): Promise<DBFactStatementWithFeed | null> {
	try {
		const record = await db
			.collection('facts')
			.getFirstListItem(
				`fact_urn="${factURN}" && network="${network.id}" ${filters ? `&& ${filters}` : ''}`,
				{
					expand: 'feed.quote_asset,feed.base_asset'
				}
			);

		const parsed = DBFactStatementWithFeedSchema.safeParse({
			...record,
			feed: {
				...record.expand?.feed,
				base_asset: record.expand?.feed.expand?.base_asset,
				quote_asset: record.expand?.feed.expand?.quote_asset
			}
		});
		if (!parsed.success) throw new Error('Failed to parse fact statement with feed');

		return parsed.data;
	} catch (e) {
		if (e instanceof Error && !e.message.includes('404'))
			logError(`Error retrieving fact by URN ${factURN}`, e);
		return null;
	}
}

export async function getFeedFactsByDateRange(
	db: PocketBase,
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
			filter: `network = "${network.id}" && feed='${feedID}' && validation_date > '${endDateFilter} 00:00:00.000Z'`
		});

		const parsedFacts = z.array(DBFactStatementSchema).parse(items);

		return parsedFacts;
	} catch (error) {
		await logError(`Error retrieving feed facts by date range`, error);
		return [];
	}
}

export async function searchFactStatements(
	db: PocketBase,
	networkID: string,
	query: string
): Promise<DBFactStatementWithFeed[]> {
	try {
		const records = await db.collection('facts').getList(1, 50, {
			filter: `network = "${networkID}" && (fact_urn ~ "${query}" || storage_urn ~ "${query}" || transaction_id ~ "${query}" || block_hash ~ "${query}")`,
			expand: 'feed.base_asset,feed.quote_asset'
		});

		const withExpandedFeeds = records.items.map((item) => {
			if (!item.expand?.feed) error(500, 'Fact is missing feed');
			const parsedFact = DBFactStatementWithFeedSchema.safeParse({
				...item,
				feed: {
					...item.expand.feed,
					base_asset: item.expand.feed.expand.base_asset,
					quote_asset: item.expand.feed.expand.quote_asset
				}
			});
			if (parsedFact.success) return parsedFact.data;
			else error(500, `Invalid fact: ${parsedFact.error}`);
		});
		const parsedFacts = z.array(DBFactStatementWithFeedSchema).parse(withExpandedFeeds);

		return parsedFacts;
	} catch (error) {
		await logError(`Error retrieving fact statement records`, error);
		return [];
	}
}

export async function searchFeeds(
	db: PocketBase,
	networkID: string,
	query: string
): Promise<Omit<Feed, 'latestFact' | 'oneDayAgo' | 'threeDaysAgo' | 'sevenDaysAgo'>[]> {
	try {
		const records = await db.collection('feeds').getList(1, 50, {
			filter: `network = "${networkID}" && feed_id ~ "${query}"`,
			expand: 'base_asset,quote_asset'
		});
		const parsedFeeds = z.array(DBFeedWithAssetsSchema).parse(
			records.items.map((item) => {
				return {
					...item,
					base_asset: item.expand?.base_asset,
					quote_asset: item.expand?.quote_asset
				};
			})
		);

		return parsedFeeds.map((feed) => {
			return {
				...feed,
				type_description: 'Current Exchange Rate',
				type_description_short: 'CER',
				totalFacts: 0 // Setting to 0 only for searching feeds
			};
		});
	} catch (error) {
		await logError(`Error retrieving feed records`, error);
		return [];
	}
}

export async function getAllNetworks(db: PocketBase): Promise<Network[]> {
	try {
		const response = await db.collection('networks').getFullList({
			expand: 'policies_via_network'
		});

		const networks: Network[] = response.map((networkRecord) => {
			const policies = networkRecord.expand?.policies_via_network
				? z
						.array(PolicySchema)
						.parse(networkRecord.expand.policies_via_network)
						.sort((a, b) => b.starting_slot - a.starting_slot)
				: [];

			return NetworkSchema.parse({
				...networkRecord,
				policies
			});
		});

		return networks;
	} catch (error) {
		await logError(`Error retrieving network records`, error);
		return [];
	}
}

export async function getNetworkSummary(
	pb: PocketBase,
	networkID: string
): Promise<NetworkSummary | null> {
	try {
		const data = await pb.send(`/api/explorer/dashboard/${networkID}`, {});
		return NetworkSummarySchema.parse(data);
	} catch (error) {
		await logError('Error retrieving network summary', error);
		return null;
	}
}

export async function getAllNodes(pb: PocketBase, network: Network): Promise<NodeWithMetadata[]> {
	try {
		const data = await pb.send(`/api/explorer/nodes/${network.id}`, {});
		const nodes = z.array(NodeWithMetadataSchema).parse(data);
		return nodes;
	} catch (error) {
		await logError('Error retrieving node records', error);
		return [];
	}
}

export async function getAllSources(
	pb: PocketBase,
	networkID: string
): Promise<SourceWithMetadata[]> {
	try {
		const data = await pb.send(`/api/explorer/sources/${networkID}`, {});
		const sources = z.array(SourceWithMetadataSchema).parse(data);
		return sources;
	} catch (error) {
		await logError('Error retrieving source records', error);
		return [];
	}
}
