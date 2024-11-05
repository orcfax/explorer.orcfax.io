import { z } from 'zod';

export const EnvironmentSchema = z.enum(['development', 'test', 'production']);
export type Environment = z.infer<typeof EnvironmentSchema>;

export type DBFactStatement = z.infer<typeof DBFactStatementSchema>;
export type DBFeed = z.infer<typeof DBFeedSchema>;
export type Feed = z.infer<typeof FeedSchema>;
export type Source = z.infer<typeof SourceSchema>;

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
	inactive_reason: z.string().optional(),
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
	latestFact: DBFactStatementSchema.nullable(),
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
	latestFact: FactStatementSchema.nullable()
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

export interface ArchiveDetails {
	sources: Source[];
	collectionTimestamp: string;
	collectorNodeID: string;
	contentSignature: string;
	calculationMethod: string;
	validationDate: string;
	sourceType: string;
}

export interface Archive {
	fact: DBFactStatement;
	directoryTree: DirectoryNode[] | null;
	files: ArchivedFile[] | null;
	details: ArchiveDetails | null;
}

export interface FactStatementStub {
	fact_urn: string;
	feed_name: string;
	feed_type: string;
	value: number;
	inverse_value: number;
	description: string;
	inverse_description: string;
	validation_date: string;
}

export interface ArchiveDownload {
	fact: FactStatementStub;
	directoryTree: DirectoryNode[];
	files: ArchivedFile[];
	details: ArchiveDetails | null;
	archiveZip: Uint8Array;
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

export const SourceSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	type: z.enum(['CEX API', 'DEX LP']),
	website: z.string(),
	image_path: z.string(),
	background_color: z.string(),
	// For CEX sources, assetPairValue is used. For DEX sources base and quote will be used.
	baseAssetValue: z.number().optional(),
	quoteAssetValue: z.number().optional(),
	assetPairValue: z.number().optional()
});

export const CollectionEventSchema = z.object({
	'@type': z.literal('Event'),
	description: z.string(),
	startDate: z.string(),
	recordedIn: z.object({
		'@type': z.literal('CreativeWork'),
		description: z.object({
			'@type': z.literal('TextObject'),
			comment: z.string(),
			sha256: z.string()
		}),
		hasPart: z.tuple([
			z.object({
				'@type': z.literal('CreativeWork'),
				description: z.literal('collecting timestamp'),
				text: z.string()
			}),
			z.object({
				'@type': z.literal('CreativeWork'),
				description: z.string().startsWith('data points for'),
				text: z.array(z.string())
			}),
			z.object({
				'@type': z.literal('CreativeWork'),
				description: z.literal('node identifier (uuid)'),
				text: z.string()
			})
		])
	})
});

export const ValidationFileSchema = z.object({
	'@context': z.literal('https://schema.org'),
	type: z.literal('MediaObject'),
	identifier: z.string(),
	isBasedOn: z.object({
		'@type': z.literal('MediaObject'),
		name: z.string(),
		identifier: z.string()
	}),
	contributor: z.object({
		'@type': z.literal('Organization'),
		name: z.string(),
		locationCreated: z.object({
			address: z.object({
				'@type': z.literal('PostalAddress'),
				addressLocality: z.string(),
				addressRegion: z.string(),
				geo: z.string()
			})
		})
	}),
	additionalType: z.tuple([CollectionEventSchema, z.unknown()])
});
export type ValidationFile = z.infer<typeof ValidationFileSchema>;

export const DEXValidationFileSchema = ValidationFileSchema.extend({
	additionalType: z.tuple([
		CollectionEventSchema,
		z.object({
			'@type': z.literal('Event'),
			description: z.string().startsWith('average price is determined by dividing total volume of'),
			startDate: z.string(),
			about: z.object({
				'@type': z.literal('Observation'),
				measurementMethod: z.tuple([
					z.string().startsWith('volume/liquidity average sum(valueReference[1])')
				]),
				value: z.coerce.number(),
				valueReference: z.array(
					z
						.string()
						.transform((str) => JSON.parse(str))
						.pipe(z.array(z.number()))
				)
			})
		})
	])
});

export type DEXValidationFile = z.infer<typeof DEXValidationFileSchema>;

export const CEXValidationFileSchema = ValidationFileSchema.extend({
	additionalType: z.tuple([
		CollectionEventSchema,
		z.object({
			'@type': z.literal('Event'),
			description: z.literal('selection of median value from collected node data'),
			startDate: z.string(),
			about: z.object({
				'@type': z.literal('StatisticalVariable'),
				measurementMethod: z.literal(
					'median calculation of a minimum of three data sources from the selected collector node'
				),
				measurementTechnique: z.array(
					z.object({
						'@type': z.literal('PropertyValue'),
						name: z.string(),
						value: z.string()
					})
				),
				variableMeasured: z.object({
					'@type': z.literal('Observation'),
					measurementMethod: z.literal('median value'),
					value: z.coerce.number(),
					valueReference: z.array(z.coerce.number())
				})
			})
		})
	])
});

export type CEXValidationFile = z.infer<typeof CEXValidationFileSchema>;

export const BagInfoSchema = z.object({
	'Bag-Software-Agent': z.string(),
	'Bagging-Date': z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: 'Invalid date format'
	}),
	'Epoch-Day': z.string().transform(Number),
	'Epoch-Hour': z.string().transform(Number),
	'Epoch-Month': z.string().transform(Number),
	'Epoch-Week': z.string().transform(Number),
	'Epoch-Year': z.string().transform(Number),
	'Fact-Datum-Identifier': z.string().uuid(),
	'Fact-Datum-URN': z.string(),
	'Fact-Datum-Value': z.string().transform(Number),
	'Fact-Description': z.string(),
	'Fact-Validation-Date': z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: 'Invalid date format'
	}),
	'Feed-ID': z.string(),
	'Feed-Name': z.string(),
	'Feed-Type': z.string(),
	'Package-Version': z.string().transform(Number),
	'Packaging-Agent': z.string(),
	'Payload-Oxum': z.string(),
	'Source-Organization': z.string(),
	'System-Identifier': z.string(),
	'System-Name': z.string(),
	'System-Version': z.string(),
	'Unix-Time': z.string().transform(Number)
});
