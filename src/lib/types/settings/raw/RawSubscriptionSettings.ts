export interface RawSubscriptionSettings {
	id: string;
	is_streaming: boolean;
	created_at: number;
	fetched_at: number;
	expires_at: number;
	guild_ids: string[];
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS subscriptions (
		"id"            VARCHAR(16)                               NOT NULL,
		"is_streaming"  BOOLEAN                                   NOT NULL,
		"created_at"    BIGINT                                    NOT NULL,
		"fetched_at"    BIGINT                                    NOT NULL,
		"expires_at"    BIGINT                                    NOT NULL,
		"guild_ids"     VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[]  NOT NULL,
		PRIMARY KEY("id")
	);
`;
