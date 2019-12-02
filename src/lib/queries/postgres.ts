import { CommonQuery, UpsertMemberSettingsReturningDifference, UpdatePurgeTwitchStreamReturning } from './common';
import PostgresProvider from '../../providers/postgres';
import { Client } from 'discord.js';
import { RawStarboardSettings } from '../types/settings/raw/RawStarboardSettings';
import { RawModerationSettings } from '../types/settings/raw/RawModerationSettings';
import { RawGiveawaySettings } from '../types/settings/raw/RawGiveawaySettings';
import { RawMemberSettings } from '../types/settings/raw/RawMemberSettings';
import { RawTwitchStreamSubscriptionSettings } from '../types/settings/raw/RawTwitchStreamSubscriptionSettings';
import { Databases } from '../types/constants/Constants';
import { RawDashboardUserSettings } from '../types/settings/raw/RawDashboardUserSettings';

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

	public async deleteTwitchStreamSubscription(streamerID: string, guildID: string) {
		const returned = await this.provider.runOne<UpsertTwitchStreamReturning>(/* sql */`
			UPDATE twitch_stream_subscriptions
			SET
				"guild_ids" = ARRAY_REMOVE(guild_ids, $2::VARCHAR)
			WHERE
				"id" = $1
			RETURNING guild_ids;
		`, [streamerID, guildID]);
		return returned.guild_ids.length === 0;
	}

	public deleteTwitchStreamSubscriptions(streamers: readonly string[]) {
		return this.provider.run(/* sql */`
			DELETE
			FROM twitch_stream_subscriptions
			WHERE
				"id" IN (${streamers.map(streamer => `${this.provider.cString(streamer)}`)});
		`);
	}

	public async purgeTwitchStreamGuildSubscriptions(guildID: string) {
		return this.provider.runAll<UpdatePurgeTwitchStreamReturning>(/* sql */`
			UPDATE twitch_stream_subscriptions
			SET
				"guild_ids" = ARRAY_REMOVE(guild_ids, $1::VARCHAR)
			WHERE
				$1 = ANY(guild_ids)
			RETURNING id, guild_ids;
		`, [guildID]);
	}

	public async fetchDashboardUser(id: string) {
		const raw = await this.provider.runOne(/* sql */`
			SELECT *
			FROM dashboard_users
			WHERE
				id = ${this.provider.cString(id)}
			LIMIT 1;
		`) as RawDashboardUserSettings | null;
		if (raw === null) return null;

		const expiresAt = Number(raw.expires_at);
		if (Date.now() > expiresAt) {
			await this.provider.delete(Databases.DashboardUsers, id);
			return null;
		}

		return {
			id,
			expiresAt,
			accessToken: raw.access_token,
			refreshToken: raw.refresh_token
		};
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
		return entry === null ? null : ({ ...entry, created_at: Number(entry.created_at) });
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
			ORDER BY
				RANDOM()
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

	public async fetchTwitchStreamSubscription(streamerID: string) {
		const entry = await this.provider.runOne<RawTwitchStreamSubscriptionSettings>(/* sql */`
			SELECT *
			FROM twitch_stream_subscriptions
			WHERE
				"id" = ${this.provider.cString(streamerID)}
			LIMIT 1;`);
		return entry === null
			? null
			: {
				id: entry.id,
				is_streaming: entry.is_streaming,
				expires_at: Number(entry.expires_at),
				guild_ids: entry.guild_ids
			};
	}

	public async fetchTwitchStreamsByGuild(guildID: string) {
		const entries = await this.provider.runAll<RawTwitchStreamSubscriptionSettings>(/* sql */`
			SELECT *
			FROM twitch_stream_subscriptions
			WHERE
				$1 = ANY(guild_ids);
		`, [guildID]);
		return entries.map(entry => ({
			id: entry.id,
			is_streaming: entry.is_streaming,
			expires_at: Number(entry.expires_at),
			guild_ids: entry.guild_ids
		}));
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

	public insertDashboardUser(entry: RawDashboardUserSettings) {
		const id = this.provider.cString(entry.id);
		const aToken = this.provider.cString(entry.access_token);
		const rToken = this.provider.cString(entry.refresh_token);
		const eAt = `'${entry.expires_at}'`;
		return this.provider.run(/* sql */`
			INSERT INTO dashboard_users ("id", "access_token", "refresh_token", "expires_at")
			VALUES (${id}, ${aToken}, ${rToken}, ${eAt})
			ON CONFLICT ON CONSTRAINT dashboard_users_user_idx
			DO
				UPDATE
				SET access_token = ${aToken},
					refresh_token = ${rToken},
					expires_at = ${eAt};
		`);
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


	public async upsertTwitchStreamSubscription(streamerID: string, guildID: string, expireSeconds = 864000) {
		const returned = await this.provider.runOne<UpsertTwitchStreamReturning>(/* sql */`
			INSERT
			INTO twitch_stream_subscriptions ("id", "is_streaming", "expires_at", "guild_ids")
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (id)
			DO
				UPDATE
				SET guild_ids = ARRAY_CAT(twitch_stream_subscriptions.guild_ids, $4)
			RETURNING guild_ids;
		`, [streamerID, false, (expireSeconds - 1) * 1000, [guildID]]);
		return returned.guild_ids.length === 1;
	}

}

type UpsertMemberSettingsReturning = Pick<RawMemberSettings, 'point_count'>;
type UpsertTwitchStreamReturning = Pick<RawTwitchStreamSubscriptionSettings, 'guild_ids'>;
