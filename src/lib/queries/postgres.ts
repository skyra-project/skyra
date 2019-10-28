import { CommonQuery, UpsertMemberSettingsReturningDifference } from './common';
import PostgresProvider from '../../providers/postgres';
import { Client } from 'discord.js';
import { RawStarboardSettings } from '../types/settings/raw/RawStarboardSettings';
import { RawModerationSettings } from '../types/settings/raw/RawModerationSettings';
import { RawGiveawaySettings } from '../types/settings/raw/RawGiveawaySettings';
import { RawMemberSettings } from '../types/settings/raw/RawMemberSettings';

export class PostgresCommonQuery implements CommonQuery {

	private client: Client;
	private get provider() {
		return this.client.providers.get('postgres') as PostgresProvider;
	}

	public constructor(client: Client) {
		this.client = client;
	}

	public deleteGiveaway(guildID: string, messageID: string) {
		return this.provider.runOne(/* sql */`
			DELETE
			FROM giveaway
			WHERE
				"guild_id"   = $1 AND
				"message_id" = $2
			RETURNING *;
		`, [guildID, messageID]);
	}

	public async deleteMemberSettings(guildID: string, userID: string) {
		return this.provider.runOne(/* sql */`
			DELETE
			FROM members
			WHERE
				"guild_id" = $1 AND
				"user_id"  = $2;
		`, [guildID, userID]);
	}

	public deleteStar(guildID: string, messageID: string) {
		return this.provider.runOne(/* sql */`
			DELETE
			FROM starboard
			WHERE
				"guild_id"   = $1 AND
				"message_id" = $2;
		`, [guildID, messageID]);
	}

	public deleteStarReturning(guildID: string, messageID: string) {
		return this.provider.runOne(/* sql */`
			DELETE
			FROM starboard
			WHERE
				"guild_id"   = $1 AND
				"message_id" = $2
			RETURNING *;
		`, [guildID, messageID]);
	}

	public deleteStarsFromChannelReturning(_guildID: string, channelID: string) {
		return this.provider.runAll(/* sql */`
			DELETE
			FROM starboard
			WHERE
				"channel_id" = $1
			RETURNING *;
		`, [channelID]);
	}

	public deleteStarsReturning(guildID: string, messageIDs: readonly string[]) {
		return this.provider.runAll(/* sql */`
			DELETE
			FROM starboard
			WHERE
				"guild_id"   = $1 AND
				"message_id" IN ('${messageIDs.join("', '")}')
			RETURNING *;
		`, [guildID]);
	}

	public fetchGiveawaysFromGuilds(guildIDs: readonly string[]) {
		return this.provider.runAll(/* sql */`
			SELECT *
			FROM giveaway
			WHERE
				"guild_id" IN ('${guildIDs.join("', '")}');
		`);
	}

	public fetchLeaderboardGlobal() {
		return this.provider.runAll(/* sql */`
			SELECT "id" as "user_id", "point_count"
			FROM users
			WHERE
				"point_count" >= 25
			ORDER BY point_count DESC
			LIMIT 25000;
		`);
	}

	public fetchLeaderboardLocal(guildID: string) {
		return this.provider.runAll(/* sql */`
			SELECT "user_id", "point_count"
			FROM members
			WHERE
				"guild_id"    = $1 AND
				"point_count" >= 25
			ORDER BY point_count DESC
			LIMIT 5000;
		`, [guildID]);
	}

	public fetchMemberSettings(guildID: string, userID: string) {
		return this.provider.runOne(/* sql */`
			SELECT *
			FROM members
			WHERE
				"guild_id" = $1 AND
				"user_id"  = $2
			LIMIT 1;
		`, [guildID, userID]) as Promise<RawMemberSettings | null>;
	}

	public async fetchModerationLogByCase(guildID: string, caseNumber: number) {
		const entry = await this.provider.runOne(/* sql */ `
			SELECT *
			FROM moderation
			WHERE
				"guild_id" = $1 AND
				"case_id"  = $2
			LIMIT 1;
		`, [guildID, caseNumber]);
		return ({ ...entry, created_at: Number(entry.created_at) });
	}

	public async fetchModerationLogByCases(guildID: string, caseNumbers: readonly number[]) {
		const entries = await this.provider.runAll(/* sql */ `
			SELECT *
			FROM moderation
			WHERE
				"guild_id" = $1 AND
				"case_id" IN (${caseNumbers.join(', ')});
		`, [guildID]);
		return entries.map(entry => ({ ...entry, created_at: Number(entry.created_at) }));
	}

	public async fetchModerationLogByGuild(guildID: string) {
		const entries = await this.provider.runAll(/* sql */ `
			SELECT *
			FROM moderation
			WHERE
				"guild_id" = $1;
		`, [guildID]);
		return entries.map(entry => ({ ...entry, created_at: Number(entry.created_at) }));
	}

	public async fetchModerationLogByUser(guildID: string, user: string) {
		const entries = await this.provider.runAll(/* sql */ `
			SELECT *
			FROM moderation
			WHERE
				"guild_id" = $1 AND
				"user_id"  = $2;
		`, [guildID, user]);
		return entries.map(entry => ({ ...entry, created_at: Number(entry.created_at) }));
	}

	public async fetchStar(guildID: string, messageID: string) {
		const result = await this.provider.runOne(/* sql */`
			SELECT *
			FROM starboard
			WHERE
				"guild_id"   = $1 AND
				"message_id" = $2
			LIMIT 1;
		`, [guildID, messageID]);
		return result || null;
	}

	public async fetchStarRandom(guildID: string, minimum: number) {
		const result = await this.provider.runOne(/* sql */`
			SELECT *
			FROM starboard
			WHERE
				"guild_id"        = $1        AND
				"star_message_id" IS NOT NULL AND
				"enabled"         = TRUE      AND
				"stars"           >= $2
			LIMIT 1;
		`, [guildID, minimum]);
		return result || null;
	}

	public fetchStars(guildID: string, minimum: number) {
		return this.provider.runAll(/* sql */`
			SELECT *
			FROM starboard
			WHERE
				"guild_id"        = $1        AND
				"star_message_id" IS NOT NULL AND
				"enabled"         = TRUE      AND
				"stars"           >= $2;
		`, [guildID, minimum]);
	}

	public insertCommandUseCounter(command: string) {
		return this.provider.run(/* sql */`
			INSERT
			INTO command_counter ("id", "uses")
			VALUES ($1, 1)
			ON CONFLICT (id)
			DO
				UPDATE
				SET uses = command_counter.uses + 1;
		`, [command]);
	}

	public insertGiveaway(entry: RawGiveawaySettings) {
		return this.provider.run(/* sql */`
			INSERT INTO giveaway ("title", "ends_at", "guild_id", "channel_id", "message_id", "minimum", "minimum_winners")
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, [entry.title, entry.ends_at, entry.guild_id, entry.channel_id, entry.message_id, entry.minimum, entry.minimum_winners]);
	}

	public insertModerationLog(entry: RawModerationSettings) {
		return this.provider.run(/* sql */`
			INSERT INTO moderation ("case_id", "created_at", "duration", "extra_data", "guild_id", "moderator_id", "reason", "user_id", "type")
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, [
			entry.case_id,
			entry.created_at,
			entry.duration,
			entry.extra_data === null ? null : JSON.stringify(entry.extra_data),
			entry.guild_id,
			entry.moderator_id,
			entry.reason,
			entry.user_id,
			entry.type
		]);
	}

	public insertStar(entry: RawStarboardSettings) {
		return this.provider.run(/* sql */`
			INSERT INTO starboard ("enabled", "user_id", "message_id", "channel_id", "guild_id", "star_message_id", "stars")
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, [entry.enabled, entry.user_id, entry.message_id, entry.channel_id, entry.guild_id, entry.star_message_id, entry.stars]);
	}

	public updateModerationLog(entry: RawModerationSettings) {
		return this.provider.run(/* sql */`
			UPDATE moderation
			SET
				"type"         = $1,
				"reason"       = $2,
				"duration"     = $3,
				"moderator_id" = $4,
				"extra_data"   = $5
			WHERE
				"guild_id" = $6 AND
				"case_id"  = $7
		`, [
			entry.type,
			entry.reason,
			entry.duration,
			entry.moderator_id,
			entry.extra_data === null ? null : JSON.stringify(entry.extra_data),
			entry.guild_id,
			entry.case_id
		]);
	}

	public updateStar(entry: RawStarboardSettings) {
		return this.provider.run(/* sql */`
			UPDATE starboard
			SET
				"enabled"         = $1,
				"user_id"         = $2,
				"star_message_id" = $3,
				"stars"           = $4
			WHERE
				"guild_id"   = $5 AND
				"message_id" = $6
		`, [entry.enabled, entry.user_id, entry.star_message_id, entry.stars, entry.guild_id, entry.message_id]);
	}

	public async upsertDecrementMemberSettings(guildID: string, userID: string, points: number) {
		const data = await this.provider.runOne<UpsertMemberSettingsReturning>(/* sql */ `
			INSERT
			INTO members ("guild_id", "user_id", "point_count")
			VALUES ($1, $2, $3)
			ON CONFLICT ON CONSTRAINT members_guild_user_idx
			DO
				UPDATE
				SET point_count = members.point_count - $3
			RETURNING point_count;
		`, [guildID, userID, points]);
		return data.point_count;
	}

	public async upsertIncrementMemberSettings(guildID: string, userID: string, points: number) {
		const data = await this.provider.runOne<UpsertMemberSettingsReturning>(/* sql */ `
			INSERT
			INTO members ("guild_id", "user_id", "point_count")
			VALUES ($1, $2, $3)
			ON CONFLICT ON CONSTRAINT members_guild_user_idx
			DO
				UPDATE
				SET point_count = members.point_count + $3
			RETURNING point_count;
		`, [guildID, userID, points]);
		return data.point_count;
	}

	public async upsertMemberSettings(guildID: string, userID: string, points: number) {
		const data = await this.provider.runOne<UpsertMemberSettingsReturning>(/* sql */ `
			INSERT
			INTO members ("guild_id", "user_id", "point_count")
			VALUES ($1, $2, $3)
			ON CONFLICT ON CONSTRAINT members_guild_user_idx
			DO
				UPDATE
				SET point_count = $3
			RETURNING point_count;
		`, [guildID, userID, points]);
		return data.point_count;
	}

	public upsertMemberSettingsDifference(guildID: string, userID: string, points: number) {
		return this.provider.runOne<UpsertMemberSettingsReturningDifference>(/* sql */ `
			INSERT
			INTO members ("guild_id", "user_id", "point_count")
			VALUES ($1, $2, $3)
			ON CONFLICT ON CONSTRAINT members_guild_user_idx
			DO
				UPDATE
				SET point_count = $3
			RETURNING point_count as new_value, (
				SELECT point_count
				FROM members
				WHERE
					"guild_id" = $1 AND
					"user_id"  = $2
				LIMIT 1
			) as old_value;
		`, [guildID, userID, points]);
	}

}

type UpsertMemberSettingsReturning = Pick<RawMemberSettings, 'point_count'>;
