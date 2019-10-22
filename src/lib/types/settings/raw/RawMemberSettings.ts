export interface RawMemberSettings {
	guild_id: string;
	user_id: string;
	point_count: number;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS members (
		"guild_id"    VARCHAR(19)           NOT NULL,
		"user_id"     VARCHAR(19)           NOT NULL,
		"point_count" BIGINT      DEFAULT 0 NOT NULL,
		CONSTRAINT members_guild_user_idx   PRIMARY KEY("guild_id", "user_id"),
		CHECK("point_count" >= 0)
	);

	CREATE INDEX IF NOT EXISTS members_guild_point_idx ON members (
		"point_count" DESC
	);
`;
