import { AnyObject } from '../../util';
import { ModerationTypeKeys } from '../../../util/constants';

export interface RawModerationSettings {
	case_id: number;
	created_at: number | null;
	duration: number | null;
	extra_data: unknown[] | AnyObject | null;
	guild_id: string;
	moderator_id: string | null;
	reason: string | null;
	user_id: string;
	type: ModerationTypeKeys;
}

export const SQL_TABLE_SCHEMA = /* sql */`
	CREATE TABLE IF NOT EXISTS moderation (
		"case_id"      INT           NOT NULL,
		"created_at"   BIGINT,
		"duration"     INTEGER,
		"extra_data"   JSON,
		"guild_id"     VARCHAR(19)   NOT NULL,
		"moderator_id" VARCHAR(19),
		"reason"       VARCHAR(2000),
		"user_id"      VARCHAR(19),
		"type"         SMALLINT      NOT NULL,
		CONSTRAINT moderation_guild_case_idx PRIMARY KEY("guild_id", "case_id"),
		CHECK("duration" >= 0 AND "duration" <= 31536000000),
		CHECK("reason" <> ''),
		CHECK("type" >= 0)
	);
`;
