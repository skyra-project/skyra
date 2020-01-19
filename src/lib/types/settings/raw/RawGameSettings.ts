export interface RawRpgItemRank {
	id: string;
	rarity: number;
}

export interface RawRpgItem {
	id: number;
	name: string;
	maximum_durability: string;
	attack: number;
	defense: number;
	health: number;
	attack_percentage: number;
	defense_percentage: number;
	health_percentage: number;
	energy_usage: number;
	range: number;
	rank: string;
}

export interface RawRpgClass {
	id: number;
	name: string;
	attack_multiplier: number;
	defense_multiplier: number;
	luck_multiplier: number;
	allowed_items: number[];
}

export interface RawRpgGuildRank {
	id: number;
	name: string;
}

export interface RawRpgGuild {
	id: number;
	name: string;
	description: string | null;
	leader: string;
	member_limit: number;
	win_count: string;
	lose_count: string;
	money_count: string;
	bank_limit: string;
	upgrade: number;
}

export interface RawRpgUser {
	id: string;
	name: string;
	win_count: string;
	guild: number;
	guild_rank: number;
	class: number;
	items: string[];
	death_count: string;
	crate_common_count: number;
	crate_uncommon_count: number;
	crate_rare_count: number;
	crate_legendary_count: number;
	luck: number;
}

export interface RawRpgUserItem {
	id: string;
	user_id: string;
	item_id: number;
	durability: string;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	BEGIN;

	CREATE TABLE IF NOT EXISTS rpg_item_ranks (
		"id"     VARCHAR(50),
		"rarity" NUMERIC     NOT NULL,
		PRIMARY KEY ("id"),
		CHECK ("name"   <> ''),
		CHECK ("rarity" >= 0)
	);

	CREATE TABLE IF NOT EXISTS rpg_item (
		"id"                 SERIAL,
		"name"               VARCHAR(50)             NOT NULL,
		"maximum_durability" BIGINT                  NOT NULL,
		"attack"             NUMERIC     DEFAULT 0.0 NOT NULL,
		"defense"            NUMERIC     DEFAULT 0.0 NOT NULL,
		"health"             NUMERIC     DEFAULT 0.0 NOT NULL,
		"attack_percentage"  NUMERIC     DEFAULT 1.0 NOT NULL,
		"defense_percentage" NUMERIC     DEFAULT 1.0 NOT NULL,
		"health_percentage"  NUMERIC     DEFAULT 1.0 NOT NULL,
		"energy_usage"       NUMERIC                 NOT NULL,
		"range"              NUMERIC                 NOT NULL,
		"rank"               VARCHAR(50)             NOT NULL,
		UNIQUE ("name", "rank"),
		PRIMARY KEY ("id"),
		FOREIGN KEY ("rank") REFERENCES rpg_item_ranks ("id"),
		CHECK ("name"               <> ''),
		CHECK ("maximum_durability" >= 0),
		CHECK ("attack"             >= 0),
		CHECK ("defense"            >= 0),
		CHECK ("health"             >= 0),
		CHECK ("attack_percentage"  >= 0),
		CHECK ("defense_percentage" >= 0),
		CHECK ("health_percentage"  >= 0),
		CHECK ("energy_usage"       >= 0),
		CHECK ("range"              >= 0)
	);

	CREATE TABLE IF NOT EXISTS rpg_class (
		"id"                 SERIAL,
		"name"               VARCHAR(20)                            NOT NULL,
		"attack_multiplier"  NUMERIC     DEFAULT 1.0                NOT NULL,
		"defense_multiplier" NUMERIC     DEFAULT 1.0                NOT NULL,
		"luck_multiplier"    NUMERIC     DEFAULT 1.0                NOT NULL,
		"allowed_items"      INTEGER[]   DEFAULT ARRAY[]::INTEGER[] NOT NULL,
		UNIQUE ("name"),
		PRIMARY KEY ("id"),
		CHECK ("name"               <> ''),
		CHECK ("attack_multiplier"  >= 0),
		CHECK ("defense_multiplier" >= 0),
		CHECK ("luck_multiplier"    >= 0)
	);

	CREATE TABLE IF NOT EXISTS rpg_guild_rank (
		"id"               SERIAL      NOT NULL,
		"name"             VARCHAR(50) NOT NULL,
		UNIQUE ("name"),
		PRIMARY KEY ("id"),
		CHECK ("name" <> '')
	);

	CREATE TABLE IF NOT EXISTS rpg_guilds (
		"id"           SERIAL,
		"name"         VARCHAR(50)                NOT NULL,
		"description"  VARCHAR(200),
		"leader"       VARCHAR(19)                NOT NULL,
		"member_limit" SMALLINT     DEFAULT 5     NOT NULL,
		"win_count"    BIGINT       DEFAULT 0     NOT NULL,
		"lose_count"   BIGINT       DEFAULT 0     NOT NULL,
		"money_count"  BIGINT       DEFAULT 0     NOT NULL,
		"bank_limit"   BIGINT       DEFAULT 50000 NOT NULL,
		"upgrade"      SMALLINT     DEFAULT 0     NOT NULL,
		UNIQUE ("leader"),
		PRIMARY KEY ("id"),
		FOREIGN KEY ("leader") REFERENCES rpg_users ("id") ON DELETE CASCADE,
		CHECK ("member_limit" >= 5),
		CHECK ("win_count"    >= 0),
		CHECK ("lose_count"   >= 0),
		CHECK ("money_count"  >= 0),
		CHECK ("bank_limit"   >= 0),
		CHECK ("upgrade"      >= 0)
	);

	CREATE TABLE IF NOT EXISTS rpg_users (
		"id"                    VARCHAR(19)                           NOT NULL,
		"name"                  VARCHAR(32)                           NOT NULL,
		"win_count"             BIGINT      DEFAULT 0                 NOT NULL,
		"guild"                 INTEGER,
		"guild_rank"            INTEGER,
		"class"                 INTEGER,
		"items"                 BIGINT[]    DEFAULT ARRAY[]::BIGINT[] NOT NULL,
		"death_count"           BIGINT      DEFAULT 0                 NOT NULL,
		"crate_common_count"    INTEGER     DEFAULT 0                 NOT NULL,
		"crate_uncommon_count"  INTEGER     DEFAULT 0                 NOT NULL,
		"crate_rare_count"      INTEGER     DEFAULT 0                 NOT NULL,
		"crate_legendary_count" INTEGER     DEFAULT 0                 NOT NULL,
		"luck"                  NUMERIC     DEFAULT 1.0               NOT NULL,
		UNIQUE ("id"),
		FOREIGN KEY ("id")         REFERENCES users          ("id") ON DELETE CASCADE,
		FOREIGN KEY ("guild")      REFERENCES rpg_guilds     ("id") ON DELETE SET NULL,
		FOREIGN KEY ("guild_rank") REFERENCES rpg_guild_rank ("id") ON DELETE SET NULL,
		FOREIGN KEY ("class")      REFERENCES rpg_class      ("id") ON DELETE SET NULL,
		CHECK ("win_count"             >= 0),
		CHECK ("death_count"           >= 0),
		CHECK ("crate_common_count"    >= 0),
		CHECK ("crate_uncommon_count"  >= 0),
		CHECK ("crate_rare_count"      >= 0),
		CHECK ("crate_legendary_count" >= 0),
		CHECK ("luck"                  >= 0)
	);

	CREATE TABLE IF NOT EXISTS rpg_user_items (
		"id"         BIGSERIAL,
		"user_id"    VARCHAR(19) NOT NULL,
		"item_id"    INTEGER     NOT NULL,
		"durability" BIGINT      NOT NULL,
		PRIMARY KEY ("id"),
		FOREIGN KEY ("user_id") REFERENCES rpg_users ("id") ON DELETE CASCADE,
		FOREIGN KEY ("item_id") REFERENCES rpg_item  ("id") ON DELETE CASCADE,
		CHECK ("durability" >= 0)
	);

	COMMIT;
`;
