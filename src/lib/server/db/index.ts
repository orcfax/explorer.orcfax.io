import { z } from 'zod';
import {
	type DBFactStatement,
	type GetFactsPageResponseDB,
	DBFactStatementSchema,
	type Feed,
	type DBFeedWithData,
	type Network,
	NetworkSchema,
	DBFeedWithAssetsSchema,
	DBFactStatementWithFeedSchema,
	type DBFactStatementWithFeed,
	type NodeWithMetadata,
	type SourceWithMetadata,
	DBFeedWithDataSchema,
	type NetworkSummary,
	NetworkSummarySchema,
	NodeWithMetadataSchema,
	SourceWithMetadataSchema,
	SourceSchema,
	type Source
} from '$lib/types';
import { logError } from '$lib/server/logger';
import type PocketBase from 'pocketbase';
import { getFeedIDWithoutVersion } from '$lib/client/helpers';

export async function getFactsPage(
	db: PocketBase,
	networkID: string,
	page: number,
	feedID: string | null
): Promise<GetFactsPageResponseDB> {
	try {
		const queryParams = new URLSearchParams({
			page: page.toString()
		});
		if (feedID) {
			queryParams.append('feedId', feedID);
		}

		const data = await db.send(`/api/explorer/facts/${networkID}?${queryParams.toString()}`, {});

		const facts = z.array(DBFactStatementWithFeedSchema).parse(data.facts);

		return {
			facts,
			totalPages: data.totalPages,
			totalFacts: data.totalFacts
		};
	} catch (error) {
		await logError(`Error retrieving facts page`, error);
		return { facts: [], totalPages: 0, totalFacts: 0 };
	}
}

export async function getFeeds(db: PocketBase, network: Network): Promise<DBFeedWithData[]> {
	try {
		const data = await db.send(`/api/explorer/feeds/${network.id}`, {});
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
		if (!feedID) return null;
		const feedIDParsed = getFeedIDWithoutVersion(feedID.replace(/\/facts\/undefined$/, ''));
		// URL-encode the feedID to handle slashes and other special characters
		const encodedFeedID = encodeURIComponent(feedIDParsed);
		const data = await db.send(`/api/explorer/feeds/${network.id}/${encodedFeedID}`, {});

		return DBFeedWithDataSchema.parse(data);
	} catch (error) {
		await logError(`Error retrieving feed by ID ${feedID}`, error);
		return null;
	}
}

export async function getFactByURN(
	db: PocketBase,
	network: Network,
	factURN: string,
	filters = ''
): Promise<DBFactStatementWithFeed | null> {
	try {
		const queryParams = new URLSearchParams();
		if (filters) {
			queryParams.append('filters', filters);
		}

		const queryString = queryParams.toString();
		const url = `/api/explorer/facts/${network.id}/${factURN}${queryString ? '?' + queryString : ''}`;

		const data = await db.send(url, {});

		return DBFactStatementWithFeedSchema.parse(data);
	} catch (e) {
		if (e instanceof Error && 'status' in e && (e as any).status !== 404)
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
		const queryParams = new URLSearchParams({
			range: rangeOfDays.toString(),
			startDate: startDate.toISOString()
		});

		// URL-encode the feedID to handle slashes and other special characters
		const encodedFeedID = encodeURIComponent(getFeedIDWithoutVersion(feedID));
		const data = await db.send(
			`/api/explorer/feeds/${network.id}/${encodedFeedID}/facts?${queryParams.toString()}`,
			{}
		);

		return z.array(DBFactStatementSchema).parse(data);
	} catch (error) {
		await logError(`Error retrieving feed facts by date range`, error);
		return [];
	}
}

export async function searchUnified(
	db: PocketBase,
	networkID: string,
	query: string
): Promise<{
	facts: DBFactStatementWithFeed[];
	feeds: Omit<Feed, 'latestFact' | 'oneDayAgo' | 'threeDaysAgo' | 'sevenDaysAgo'>[];
}> {
	try {
		const queryParams = new URLSearchParams({
			q: query
		});

		const data = await db.send(`/api/explorer/search/${networkID}?${queryParams.toString()}`, {});

		const facts = z.array(DBFactStatementWithFeedSchema).parse(data.facts || []);
		const feeds = z
			.array(DBFeedWithAssetsSchema)
			.parse(data.feeds || [])
			.map((feed) => ({
				...feed,
				type_description: 'Current Exchange Rate',
				type_description_short: 'CER',
				totalFacts: 0 // Setting to 0 only for searching feeds
			}));

		return { facts, feeds };
	} catch (error) {
		await logError(`Error retrieving search results`, error);
		return { facts: [], feeds: [] };
	}
}

export async function getAllNetworks(db: PocketBase): Promise<Network[]> {
	try {
		const data = await db.send('/api/explorer/networks', {});

		return z.array(NetworkSchema).parse(data);
	} catch (error) {
		await logError(`Error retrieving network records`, error);
		return [];
	}
}

export async function getNetworkSummary(
	db: PocketBase,
	networkID: string
): Promise<NetworkSummary | null> {
	try {
		const data = await db.send(`/api/explorer/dashboard/${networkID}`, {});
		return NetworkSummarySchema.parse(data);
	} catch (error) {
		await logError('Error retrieving network summary', error);
		return null;
	}
}

export async function getAllNodes(db: PocketBase, network: Network): Promise<NodeWithMetadata[]> {
	try {
		const data = await db.send(`/api/explorer/nodes/${network.id}`, {});
		const nodes = z.array(NodeWithMetadataSchema).parse(data);
		return nodes;
	} catch (error) {
		await logError('Error retrieving node records', error);
		return [];
	}
}

export async function getAllSourcesWithMetadata(
	db: PocketBase,
	networkID: string
): Promise<SourceWithMetadata[]> {
	try {
		const data = await db.send(`/api/explorer/sources-with-metadata/${networkID}`, {});
		const sources = z.array(SourceWithMetadataSchema).parse(data);
		return sources;
	} catch (error) {
		await logError('Error retrieving source records', error);
		return [];
	}
}

export async function getAllSources(db: PocketBase, networkID: string): Promise<Source[]> {
	const data = await db.send(`/api/explorer/sources/${networkID}`, {});
	const sources = z.array(SourceSchema).parse(data);
	return sources;
}
