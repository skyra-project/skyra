// TODO: Add all other planned types

export interface RawSubscriptionSettings {
	id: string;
	isStreaming: boolean;
	createdAt: number;
	fetchedAt: number;
	expiresAt: number;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS subscriptions (
		"id"           VARCHAR(16)   NOT NULL,
		"isStreaming"  BOOLEAN       NOT NULL,
		"createdAt"    BIGINT        NOT NULL,
		"fetchedAt"    BIGINT        NOT NULL,
		"expiresAt"    BIGINT        NOT NULL,
		PRIMARY KEY("id"),
	);
`;
