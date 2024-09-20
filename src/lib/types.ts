import { z } from 'zod';

export const EnvironmentSchema = z.enum(['development', 'test', 'production']);
export type Environment = z.infer<typeof EnvironmentSchema>;

export type DBFactStatement = z.infer<typeof DBFactStatementSchema>;
export type DBFeed = z.infer<typeof DBFeedSchema>;
export type Feed = z.infer<typeof FeedSchema>;

export const AssetSchema = z.object({
	ticker: z.string(),
	name: z.string().optional(),
	url: z.string().optional(),
	image: z.string().optional(),
	backgroundColor: z.string().optional()
});

export const NetworkSelectSchema = z.object({
	value: z.string(),
	label: z.string(),
	color: z.string().optional()
});

export type NetworkSelect = z.infer<typeof NetworkSelectSchema>;

export type Asset = z.infer<typeof AssetSchema>;

export interface OrcfaxStats {
	totalFacts: number;
	totalFacts24Hour: number;
	totalFeeds: number;
}

export const TagSchema = z.object({
	name: z.enum([
		'System Identifier',
		'System Name',
		'System Version',
		'Package Version',
		'Feed Name',
		'Feed Type',
		'Fact Datum URN',
		'Fact Datum Identifier',
		'Fact Description',
		'Fact Datum Value',
		'Fact Validation Date',
		'Source Organization',
		'Content-Type'
	]),
	value: z.string()
});

export const DBFeedSchema = z.object({
	id: z.string(),
	network: z.string(),
	feed_id: z.string(),
	type: z.string(),
	name: z.string(),
	version: z.number(),
	status: z.enum(['active', 'inactive']),
	source_type: z.enum(['CEX', 'DEX', '']),
	funding_type: z.enum(['showcase', 'paid', 'subsidized', '']),
	calculation_method: z.string(),
	heartbeat_interval: z.number(),
	deviation: z.number()
});

export const DBFactStatementSchema = z.object({
	id: z.string(),
	network: z.string(),
	policy: z.string(),
	fact_urn: z.string(),
	feed: z.union([z.string(), DBFeedSchema]), // Equal to either the id of the feed, or the feed itself if it was expanded
	value: z.coerce.number(),
	value_inverse: z.coerce.number(),
	validation_date: z.coerce.date(),
	publication_date: z.coerce.date(),
	transaction_id: z.string(),
	storage_urn: z.string(),
	block_hash: z.string(),
	output_index: z.number(),
	address: z.string(),
	slot: z.number(),
	statement_hash: z.string(),
	publication_cost: z.number()
});

export const FactStatementSchema = DBFactStatementSchema.extend({
	fact_id: z.string(), // Equal to the fact_urn but without the "urn:orcfax:" prefix
	formatted_value: z.string(),
	formatted_inverse_value: z.string(),
	description: z.string(),
	inverse_description: z.string(),
	validation_date_formatted: z.string(),
	validation_time_formatted: z.string(),
	publication_date_formatted: z.string(),
	publication_time_formatted: z.string()
});

export const DBFeedWithDataSchema = DBFeedSchema.extend({
	latestFact: DBFactStatementSchema,
	totalFacts: z.number(),
	type_description: z.string(),
	base_asset: AssetSchema,
	quote_asset: AssetSchema,
	oneDayAgo: z.number(),
	threeDaysAgo: z.number(),
	sevenDaysAgo: z.number()
});

export type DBFeedWithData = z.infer<typeof DBFeedWithDataSchema>;

export const FeedHistoricalValuesSchema = z.object({
	feedID: z.string(),
	oneDayAgo: z.number(),
	threeDaysAgo: z.number(),
	sevenDaysAgo: z.number()
});

export type FeedHistoricalValues = z.infer<typeof FeedHistoricalValuesSchema>;

export const FeedSchema = DBFeedWithDataSchema.extend({
	latestFact: FactStatementSchema
});

export const FeedLayoutDataSchema = z.object({
	feed: DBFeedWithDataSchema
});

export type FeedLayoutData = z.infer<typeof FeedLayoutDataSchema>;

export const FeedPageDataSchema = z.object({
	range: z.union([z.literal('1'), z.literal('3'), z.literal('7')]),
	selectedFact: DBFactStatementSchema
});

export type FeedPageData = z.infer<typeof FeedPageDataSchema>;

export const SelectedFactStoreSchema = z.object({
	selectedFact: FactStatementSchema.extend({ feed: FeedSchema })
});

export type SelectedFactStore = z.infer<typeof SelectedFactStoreSchema>;

export const FeedContextSchema = z.object({
	feed: FeedSchema,
	selectedFact: FactStatementSchema,
	chartFacts: z.promise(z.array(FactStatementSchema))
});

export type FeedContext = z.infer<typeof FeedContextSchema>;

export const FactStatementArchiveMetadataSchema = z.object({
	system_identifier: z.string(),
	system_version: z.string(),
	package_version: z.string(),
	storage_cost: z.number()
});

export type FactStatement = z.infer<typeof FactStatementSchema>;

export interface GetOrcfaxSummaryResponse {
	facts: FactStatement[];
	totalFacts: number;
	totalFacts24Hour: number;
	feeds: Feed[];
}

export interface GetFactsPageResponse {
	facts: FactStatement[];
	totalPages: number;
	totalFacts: number;
}

export interface GetSelectedFactResponse {
	selectedFact: FactStatement;
}

export interface GetOrcfaxSummaryResponseDB {
	totalFacts: number;
	totalFacts24Hour: number;
	totalFeeds: number;
}

export interface GetFactsPageResponseDB {
	facts: DBFactStatement[];
	totalPages: number;
	totalFacts: number;
}

export const FeedRangeSchema = z.enum(['1', '3', '7']);
export type FeedRange = z.infer<typeof FeedRangeSchema>;
export function getFeedChartRange(range: string | null | undefined): FeedRange {
	return FeedRangeSchema.safeParse(range).data ?? '1';
}

export const ChartFactsResponseSchema = z.object({
	facts: z.array(FactStatementSchema)
});

export type ChartFactsResponse = z.infer<typeof ChartFactsResponseSchema>;

export const DBNetworkSchema = z.object({
	id: z.string(),
	name: z.string(),
	fact_statement_pointer: z.string(),
	script_token: z.string(),
	arweave_wallet_address: z.string(),
	arweave_system_identifier: z.string(),
	cardano_smart_contract_address: z.string(),
	chain_index_base_url: z.string(),
	active_feeds_url: z.string(),
	block_explorer_base_url: z.string(),
	arweave_explorer_base_url: z.string(),
	last_block_hash: z.string(),
	last_checkpoint_slot: z.number(),
	zero_time: z.number(),
	zero_slot: z.number(),
	slot_length: z.number(),
	is_enabled: z.boolean()
});

export type DBNetwork = z.infer<typeof DBNetworkSchema>;

export const PolicySchema = z.object({
	network: z.union([z.string(), DBNetworkSchema]),
	policy_id: z.string(),
	starting_slot: z.number(),
	starting_block_hash: z.string(),
	starting_date: z.coerce.date()
});

export type Policy = z.infer<typeof PolicySchema>;

export const DBPolicySchema = PolicySchema.extend({
	id: z.string()
});

export type DBPolicy = z.infer<typeof DBPolicySchema>;

export const NetworkSchema = DBNetworkSchema.extend({
	policies: z.array(PolicySchema),
	database: z.object({
		fact_statements: z.string(),
		feeds: z.string()
	})
});

export type Network = z.infer<typeof NetworkSchema>;

// Archive Explorer

export type ArweaveTransaction = z.infer<typeof ArweaveTransactionSchema>;
export type ArweaveTransactionsResponse = z.infer<typeof ArweaveTransactionsResponseSchema>;

export const ArweaveTransactionSchema = z.object({
	cursor: z.string(),
	node: z.object({
		id: z.string(),
		tags: z.array(TagSchema)
	})
});

export const ArweaveTransactionsResponseSchema = z.object({
	transactions: z.object({
		pageInfo: z.object({
			hasNextPage: z.boolean()
		}),
		edges: z.array(ArweaveTransactionSchema)
	})
});

export interface ArchiveExplorerResponse {
	fact: FactSourceMessage;
	directoryTree: DirectoryNode[] | null;
	files: ArchivedFile[] | null;
}

export interface Archive {
	fact: DBFactStatement;
	directoryTree: DirectoryNode[] | null;
	files: ArchivedFile[] | null;
}

export interface DirectoryNode {
	type: 'file' | 'folder';
	name: string;
	nodes?: DirectoryNode[];
}

export interface ArchivedFile {
	name: string;
	fileName: string;
	extension: string;
	content: string | object;
}

export interface FactSourceMessage {
	'@context': 'https://schema.org';
	'@type': 'Message';
	name: string;
	sender: string;
	identifier: string;
	dateReceived: string;
	messageAttachment: {
		encoding: string;
		text: string | { request_url: string; response?: string | object };
	};
}
