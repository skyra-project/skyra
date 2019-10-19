export interface RawUserSettings {
	id: string;
	command_uses: number;
	banner_set: string[];
	banner_list: string[];
	badge_set: string[];
	badge_list: string[];
	color: number;
	marry: string[];
	money: number;
	point_count: number;
	reputation_count: number;
	next_daily: number | null;
	next_reputation: number | null;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS users (
		"id"               VARCHAR(19)                               NOT NULL,
		"command_uses"     INTEGER       DEFAULT 0                   NOT NULL,
		"banner_set"       VARCHAR(6),
		"banner_list"      VARCHAR(6)[]  DEFAULT "{}"::VARCHAR(6)[]  NOT NULL,
		"badge_set"        VARCHAR(6)[]  DEFAULT "{}"::VARCHAR(6)[]  NOT NULL,
		"badge_list"       VARCHAR(6)[]  DEFAULT "{}"::VARCHAR(6)[]  NOT NULL,
		"color"            INTEGER       DEFAULT 0                   NOT NULL,
		"marry"            VARCHAR(19)[] DEFAULT "{}"::VARCHAR(19)[] NOT NULL,
		"money"            INTEGER       DEFAULT 0                   NOT NULL,
		"point_count"      INTEGER       DEFAULT 0                   NOT NULL,
		"reputation_count" INTEGER       DEFAULT 0                   NOT NULL,
		"next_daily"       TIMESTAMP,
		"next_reputation"  TIMESTAMP,
		CONSTRAINT users_user_idx PRIMARY KEY ("id")
	);
`;
