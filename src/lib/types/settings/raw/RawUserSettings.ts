export interface RawUserSettings {
	id: string;
	command_uses: number;
	banner_list: string[];
	badge_set: string[];
	badge_list: string[];
	color: number;
	marry: string[];
	money: number;
	point_count: number;
	reputation_count: number;
	theme_level: string;
	theme_profile: string;
	dark_theme: boolean;
	moderation_dm: boolean;
	next_daily: number | null;
	next_reputation: number | null;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS users (
		"id"               VARCHAR(19)                               NOT NULL,
		"command_uses"     INTEGER       DEFAULT 0                   NOT NULL,
		"banner_list"      VARCHAR(6)[]  DEFAULT '{}'::VARCHAR(6)[]  NOT NULL,
		"badge_set"        VARCHAR(6)[]  DEFAULT '{}'::VARCHAR(6)[]  NOT NULL,
		"badge_list"       VARCHAR(6)[]  DEFAULT '{}'::VARCHAR(6)[]  NOT NULL,
		"color"            INTEGER       DEFAULT 0                   NOT NULL,
		"marry"            VARCHAR(19)[] DEFAULT '{}'::VARCHAR(19)[] NOT NULL,
		"money"            BIGINT        DEFAULT 0                   NOT NULL,
		"point_count"      INTEGER       DEFAULT 0                   NOT NULL,
		"reputation_count" INTEGER       DEFAULT 0                   NOT NULL,
		"theme_level"      VARCHAR(6)    DEFAULT '1001'              NOT NULL,
		"theme_profile"    VARCHAR(6)    DEFAULT '0001'              NOT NULL,
		"dark_theme"       BOOLEAN       DEFAULT FALSE               NOT NULL,
		"moderation_dm"    BOOLEAN       DEFAULT TRUE                NOT NULL,
		"next_daily"       BIGINT,
		"next_reputation"  BIGINT,
		CONSTRAINT users_user_idx PRIMARY KEY ("id"),
		CHECK("command_uses" >= 0),
		CHECK("color" >= 0 AND "color" <= 16777215),
		CHECK("money" >= 0),
		CHECK("point_count" >= 0),
		CHECK("reputation_count" >= 0),
		CHECK("next_daily" >= 0),
		CHECK("next_reputation" >= 0)
	);
`;
