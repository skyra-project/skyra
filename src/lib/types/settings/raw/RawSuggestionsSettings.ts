export interface RawSuggestionSettings {
	id: number;
	message_id: string;
	guild_id: string;
	author_id: string;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS suggestions (
		"message_id" VARCHAR(19) NOT NULL,
		"id"         INTEGER     NOT NULL,
		"guild_id"   VARCHAR(19) NOT NULL,
		"author_id"  VARCHAR(19) NOT NULL,
		CONSTRAINT suggestion_guild_id_idx PRIMARY KEY("guild_id", "id")
	);
`;
