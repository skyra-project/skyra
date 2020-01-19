// TODO(kyranet): Make the type interfaces

export const SQL_TABLE_SCHEMA = /* sql */`
	BEGIN;

	CREATE TABLE IF NOT EXISTS rpg_item_ranks (
		"id"     SERIAL      NOT NULL,
		"name"   VARCHAR(50) NOT NULL,
		"rarity" NUMERIC     NOT NULL,
		CONSTRAINT rpg_item_ranks_idx PRIMARY KEY ("id")
	);

	CREATE TABLE IF NOT EXISTS rpg_item (
		"id"                 SERIAL                  NOT NULL,
		"name"               VARCHAR(50)             NOT NULL,
		"maximum_durability" BIGINT                  NOT NULL,
		"attack"             NUMERIC     DEFAULT 0.0 NOT NULL,
		"defense"            NUMERIC     DEFAULT 0.0 NOT NULL,
		"health"             NUMERIC     DEFAULT 0.0 NOT NULL,
		"attack_percentage"  NUMERIC     DEFAULT 1.0 NOT NULL,
		"defense_percentage" NUMERIC     DEFAULT 1.0 NOT NULL,
		"health_percentage"  NUMERIC     DEFAULT 1.0 NOT NULL,
		"energy_attack"      NUMERIC                 NOT NULL,
		"energy_storage"     NUMERIC                 NOT NULL,
		"range"              NUMERIC                 NOT NULL,
		"rank"               INTEGER                 NOT NULL,
		CONSTRAINT rpg_item_idx PRIMARY KEY ("id"),
		FOREIGN KEY ("rank") REFERENCES rpg_item_ranks ("id")
	);

	CREATE TABLE IF NOT EXISTS rpg_class (
		"id"                 SERIAL                                 NOT NULL,
		"name"               VARCHAR(20)                            NOT NULL,
		"attack_multiplier"  NUMERIC     DEFAULT 1.0                NOT NULL,
		"defense_multiplier" NUMERIC     DEFAULT 1.0                NOT NULL,
		"luck_multiplier"    NUMERIC     DEFAULT 1.0                NOT NULL,
		"allowed_items"      INTEGER[]   DEFAULT ARRAY[]::INTEGER[] NOT NULL,
		CONSTRAINT rpg_class_idx PRIMARY KEY ("id")
	);

	CREATE TABLE IF NOT EXISTS rpg_guild_rank (
		"id"               SERIAL      NOT NULL,
		"name"             VARCHAR(50) NOT NULL,
		CONSTRAINT rpg_guild_rank_idx PRIMARY KEY ("id")
	);

	CREATE TABLE IF NOT EXISTS rpg_guilds (
		"id"           SERIAL                     NOT NULL,
		"name"         VARCHAR(50)                NOT NULL,
		"description"  VARCHAR(200),
		"leader"       VARCHAR(19)                NOT NULL,
		"member_limit" SMALLINT                   NOT NULL,
		"win_count"    BIGINT       DEFAULT 0     NOT NULL,
		"lose_count"   BIGINT       DEFAULT 0     NOT NULL,
		"money_count"  BIGINT       DEFAULT 0     NOT NULL,
		"bank_limit"   BIGINT       DEFAULT 50000 NOT NULL,
		"upgrade"      SMALLINT     DEFAULT 0     NOT NULL,
		CONSTRAINT rpg_guilds_idx PRIMARY KEY ("id"),
		FOREIGN KEY ("leader") REFERENCES rpg_users ("id")
	);

	CREATE TABLE IF NOT EXISTS rpg_users (
		"id"                    VARCHAR(19)                           NOT NULL,
		"name"                  VARCHAR(20)                           NOT NULL,
		"win_count"             BIGINT      DEFAULT 0                 NOT NULL,
		"guild"                 BIGINT,
		"guild_rank"            INTEGER,
		"class"                 INTEGER,
		"items"                 BIGINT[]    DEFAULT ARRAY[]::BIGINT[] NOT NULL,
		"death_count"           BIGINT      DEFAULT 0                 NOT NULL,
		"crate_common_count"    INTEGER     DEFAULT 0                 NOT NULL,
		"crate_uncommon_count"  INTEGER     DEFAULT 0                 NOT NULL,
		"crate_rare_count"      INTEGER     DEFAULT 0                 NOT NULL,
		"crate_legendary_count" INTEGER     DEFAULT 0                 NOT NULL,
		"luck"                  NUMERIC     DEFAULT 1.0               NOT NULL,
		CONSTRAINT rpg_users_idx PRIMARY KEY ("id"),
		FOREIGN KEY ("guild")      REFERENCES rpg_guilds     ("id"),
		FOREIGN KEY ("guild_rank") REFERENCES rpg_guild_rank ("id"),
		FOREIGN KEY ("class")      REFERENCES rpg_class      ("id")
	);

	CREATE TABLE IF NOT EXISTS rpg_user_items (
		"id" BIGSERIAL NOT NULL,
		"user_id" VARCHAR(19) NOT NULL,
		"item_id" INTEGER NOT NULL,
		"durability" BIGINT NOT NULL,
		FOREIGN KEY ("user_id") REFERENCES rpg_users ("id") ON DELETE CASCADE,
		FOREIGN KEY ("item_id") REFERENCES rpg_item  ("id") ON DELETE CASCADE,
		CHECK ("durability" >= 0)
	);

	COMMIT;
`;
