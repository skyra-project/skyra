export interface RawStarboardSettings {
	enabled: boolean;
	user_id: string;
	message_id: string;
	channel_id: string;
	guild_id: string;
	star_message_id: string | null;
	stars: number;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS starboard (
		"enabled"         BOOLEAN     NOT NULL,
		"user_id"         VARCHAR(19) NOT NULL,
		"message_id"      VARCHAR(19) NOT NULL,
		"channel_id"      VARCHAR(19) NOT NULL,
		"guild_id"        VARCHAR(19) NOT NULL,
		"star_message_id" VARCHAR(19),
		"stars"           INTEGER     NOT NULL,
		CONSTRAINT starboard_guild_message_idx PRIMARY KEY("guild_id", "message_id"),
		CHECK("stars" >= 0)
	);
`;
