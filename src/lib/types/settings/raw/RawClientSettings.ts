export interface RawClientSettings {
	'id': string;
	'commandUses': number;
	'userBlacklist': readonly string[];
	'guildBlacklist': readonly string[];
	'schedules': readonly object[];
	'boosts_guilds': readonly string[];
	'boosts_users': readonly string[];
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS "clientStorage" (
		"id"             VARCHAR(19)                              NOT NULL,
		"commandUses"    INTEGER       DEFAULT 0                  NOT NULL,
		"userBlacklist"  VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"guildBlacklist" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"schedules"      JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"boosts_guilds"  VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"boosts_users"   VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		PRIMARY KEY("id"),
		CHECK("commandUses" >= 0)
	);
`;
