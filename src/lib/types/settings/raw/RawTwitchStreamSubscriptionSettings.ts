export interface RawTwitchStreamSubscriptionSettings {
	id: string;
	is_streaming: boolean;
	expires_at: number;
	guild_ids: string[];
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS twitch_stream_subscriptions (
		"id"            VARCHAR(16)                               NOT NULL,
		"is_streaming"  BOOLEAN                                   NOT NULL,
		"expires_at"    BIGINT                                    NOT NULL,
		"guild_ids"     VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[]  NOT NULL,
		PRIMARY KEY("id")
	);
`;
