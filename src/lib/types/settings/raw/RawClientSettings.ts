export interface RawClientSettings {
	'commandUses': number;
	'userBlacklist': readonly string[];
	'guildBlacklist': readonly string[];
	'schedules': readonly object[];
	'boosts_guilds': readonly string[];
	'boosts_users': readonly string[];
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS "clientStorage" (
		"id"             VARCHAR(19),
		"commandUses"    INTEGER,
		"userBlacklist"  VARCHAR(19)[],
		"guildBlacklist" VARCHAR(19)[],
		"schedules"      JSON,
		"boosts_guilds"  VARCHAR(19)[],
		"boosts_users"   VARCHAR(19)[],
		PRIMARY KEY("id")
	);
`;
