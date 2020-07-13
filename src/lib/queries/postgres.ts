import { Databases } from '@lib/types/constants/Constants';
import type { RawDashboardUserSettings } from '@lib/types/settings/raw/RawDashboardUserSettings';
import type { RawRpgItem } from '@lib/types/settings/raw/RawGameSettings';
import type { RawGiveawaySettings } from '@lib/types/settings/raw/RawGiveawaySettings';
import type { RawMemberSettings } from '@lib/types/settings/raw/RawMemberSettings';
import type { RawModerationSettings } from '@lib/types/settings/raw/RawModerationSettings';
import type { RawStarboardSettings } from '@lib/types/settings/raw/RawStarboardSettings';
import type { RawSuggestionSettings } from '@lib/types/settings/raw/RawSuggestionsSettings';
import type { RawTwitchStreamSubscriptionSettings } from '@lib/types/settings/raw/RawTwitchStreamSubscriptionSettings';
import PostgresProvider from '@root/providers/postgres';
import { Time } from '@utils/constants';
import type { Client } from 'discord.js';
import type { CommonQuery, TwitchStreamSubscriptionSettings, UpdatePurgeTwitchStreamReturning, UpsertMemberSettingsReturningDifference } from './common';

export class PostgresCommonQuery implements CommonQuery {

	private client: Client;
	private get provider() {
		return this.client.providers.get('postgres') as PostgresProvider;
	}

	public constructor(client: Client) {
		this.client = client;
	}

	public async deleteUserEntries(userID: string) {
		const { provider } = this;
		const cID = `${provider.cString(userID)}::VARCHAR`;

		await provider.run(/* sql */`
			-- Begin transaction
			BEGIN;

			-- Divorce from all users
			UPDATE users
			SET
				marry = ARRAY_REMOVE(marry, ${cID})
			WHERE
				"id" IN (SELECT UNNEST(marry) FROM users WHERE id = ${cID});

			-- Prune user entry
			DELETE
			FROM users
			WHERE
				"id" = ${cID};

			-- Prune all member entries
			DELETE
			FROM members
			WHERE
				"user_id" = ${cID};

			-- Commit all changes to disk
			COMMIT;
		`);
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

	public deleteMemberSettings(guildID: string, userID: string) {
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

	public deleteSuggestion(guildID: string, suggestionID: number) {
		return this.provider.runOne(/* sql */`
			DELETE
			FROM suggestions
			WHERE
				"guild_id" = $1 AND
				"id"       = $2;
			RETURNING *;
		`, [guildID, suggestionID]);
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

	public purgeTwitchStreamGuildSubscriptions(guildID: string) {
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

	public async fetchModerationCurrentCaseID(guildID: string) {
		const { provider } = this;
		const entry = await this.provider.runOne(/* sql */ `
			SELECT MAX(case_id)
			FROM moderation
			WHERE
				"guild_id" = ${provider.cString(guildID)}
			LIMIT 1;
		`) as { max: number | null };

		return entry.max === null ? 0 : entry.max;
	}

	public async fetchModerationLogByCase(guildID: string, caseNumber: number) {
		const { provider } = this;
		const entry = await this.provider.runOne(/* sql */ `
			SELECT *
			FROM moderation
			WHERE
				"guild_id" = ${provider.cString(guildID)} AND
				"case_id"  = ${provider.cNumber(caseNumber)}
			LIMIT 1;
		`);
		return entry === null ? null : ({ ...entry, created_at: Number(entry.created_at) });
	}

	public async fetchModerationLogsByCases(guildID: string, caseNumbers: readonly number[]) {
		const { provider } = this;
		const entries = await this.provider.runAll(/* sql */ `
			SELECT *
			FROM moderation
			WHERE
				"guild_id" = ${provider.cString(guildID)} AND
				"case_id" IN (${caseNumbers.map(v => provider.cNumber(v)).join(', ')})
			ORDER BY case_id ASC;
		`);
		return entries.map(entry => ({ ...entry, created_at: Number(entry.created_at) }));
	}

	public async fetchModerationLogsByGuild(guildID: string) {
		const { provider } = this;
		const entries = await this.provider.runAll(/* sql */ `
			SELECT *
			FROM moderation
			WHERE
				"guild_id" = ${provider.cString(guildID)}
			ORDER BY case_id ASC;
		`);
		return entries.map(entry => ({ ...entry, created_at: Number(entry.created_at) }));
	}

	public async fetchModerationLogsByUser(guildID: string, user: string) {
		const { provider } = this;
		const entries = await this.provider.runAll(/* sql */ `
			SELECT *
			FROM moderation
			WHERE
				"guild_id" = ${provider.cString(guildID)} AND
				"user_id"  = ${provider.cString(user)}
			ORDER BY case_id ASC;
		`);
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
		const { provider } = this;
		const result = await this.provider.runOne(/* sql */`
			SELECT *
			FROM starboard
			WHERE
				"guild_id"        = ${provider.cString(guildID)}  AND
				"star_message_id" IS NOT NULL                     AND
				"enabled"         = TRUE                          AND
				"stars"           >= ${provider.cNumber(minimum)}
			ORDER BY
				RANDOM()
			LIMIT 1;
		`);
		return result || null;
	}

	public async fetchStarRandomFromUser(guildID: string, userID: string, minimum: number) {
		const { provider } = this;
		const result = await this.provider.runOne(/* sql */`
			SELECT *
			FROM starboard
			WHERE
				"guild_id"        = ${provider.cString(guildID)}  AND
				"star_message_id" IS NOT NULL                     AND
				"enabled"         = TRUE                          AND
				"user_id"         = ${provider.cString(userID)}   AND
				"stars"           >= ${provider.cNumber(minimum)}
			ORDER BY
				RANDOM()
			LIMIT 1;
		`);
		return result || null;
	}

	public fetchStars(guildID: string, minimum: number) {
		const { provider } = this;
		return this.provider.runAll(/* sql */`
			SELECT *
			FROM starboard
			WHERE
				"guild_id"        = ${provider.cString(guildID)}  AND
				"star_message_id" IS NOT NULL                     AND
				"enabled"         = TRUE                          AND
				"stars"           >= ${provider.cNumber(minimum)};
		`);
	}

	public fetchStarsFromUser(guildID: string, userID: string, minimum: number) {
		const { provider } = this;
		return this.provider.runAll(/* sql */`
			SELECT *
			FROM starboard
			WHERE
				"guild_id"        = ${provider.cString(guildID)}  AND
				"star_message_id" IS NOT NULL                     AND
				"enabled"         = TRUE                          AND
				"user_id"         = ${provider.cString(userID)}   AND
				"stars"           >= ${provider.cNumber(minimum)};
		`);
	}

	public fetchSuggestions(guildID: string) {
		return this.provider.runAll<RawSuggestionSettings>(/* sql */`
			SELECT *
			FROM suggestions
			WHERE
				"guild_id" = $1;
		`, [guildID]);
	}

	public fetchSuggestion(guildID: string, suggestionID: number) {
		return this.provider.runOne<RawSuggestionSettings>(/* sql */`
			SELECT *
			FROM suggestions
			WHERE
				"guild_id" = $1 AND
				"id"       = $2;
		`, [guildID, suggestionID]);
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
		})) as TwitchStreamSubscriptionSettings[];
	}

	public async fetchAllTwitchStreams() {
		const entries = await this.provider.runAll<RawTwitchStreamSubscriptionSettings>(/* sql */`
			SELECT *
			FROM twitch_stream_subscriptions;
		`);
		return entries.map(entry => ({
			id: entry.id,
			is_streaming: entry.is_streaming,
			expires_at: Number(entry.expires_at),
			guild_ids: entry.guild_ids
		})) as TwitchStreamSubscriptionSettings[];
	}

	public retrieveRandomItem(luck: number) {
		const { provider } = this;
		const percentage = luck === 0 ? '' : ` * (1.0 / ${provider.cNumber(luck)})`;
		return provider.runOne<RawRpgItem>(/* sql */`
			WITH CTE AS (
				SELECT RANDOM()${percentage} * (SELECT SUM(rarity) FROM rpg_items) R
			)
			SELECT "id", "name", "rarity"
			FROM (
				SELECT rpg_items.*, SUM(rarity) OVER (ORDER BY id) S, R
				FROM rpg_items CROSS JOIN CTE
			) Q
			WHERE S >= R
			ORDER BY id
			LIMIT 1;
		`);
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
		const { provider } = this;
		return provider.run(/* sql */`
			INSERT INTO moderation (
				"case_id",
				"created_at",
				"duration",
				"extra_data",
				"guild_id",
				"moderator_id",
				"reason",
				"image_url",
				"user_id",
				"type"
			)
			VALUES (
				${provider.cNumber(entry.case_id)},
				${provider.cNullableNumber(entry.created_at)},
				${provider.cNullableNumber(entry.duration)},
				${provider.cNullableJson(entry.extra_data)},
				${provider.cString(entry.guild_id)},
				${provider.cNullableString(entry.moderator_id)},
				${provider.cNullableString(entry.reason)},
				${provider.cNullableString(entry.image_url)},
				${provider.cString(entry.user_id)},
				${provider.cNumber(entry.type)}
			)
		`);
	}

	public insertStar(entry: RawStarboardSettings) {
		return this.provider.run(/* sql */`
			INSERT INTO starboard ("enabled", "user_id", "message_id", "channel_id", "guild_id", "star_message_id", "stars")
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, [entry.enabled, entry.user_id, entry.message_id, entry.channel_id, entry.guild_id, entry.star_message_id, entry.stars]);
	}

	public insertRpgGuild(leaderID: string, name: string) {
		const { provider } = this;
		const cLeader = provider.cString(leaderID);
		const cName = provider.cString(name);
		return provider.run(/* sql */`
			WITH g AS (
				INSERT INTO rpg_guilds ("name", "leader")
				VALUES (${cName}, ${cLeader})
				RETURNING id
			)
			UPDATE rpg_users
				SET guild_id = (SELECT id FROM g)
				WHERE id = ${cLeader};
		`);
	}

	public insertSuggestion(entry: RawSuggestionSettings) {
		return this.provider.run(/* sql */`
			INSERT INTO suggestions ("id", "message_id", "guild_id", "author_id")
			VALUES ($1, $2, $3, $4);
		`, [entry.id, entry.message_id, entry.guild_id, entry.author_id]);
	}

	public updateModerationLog(entry: RawModerationSettings) {
		const { provider } = this;
		return this.provider.run(/* sql */`
			UPDATE moderation
			SET
				"type"         = ${provider.cNumber(entry.type)},
				"reason"       = ${provider.cNullableString(entry.reason)},
				"image_url"    = ${provider.cNullableString(entry.image_url)},
				"duration"     = ${provider.cNullableNumber(entry.duration)},
				"moderator_id" = ${provider.cNullableString(entry.moderator_id)},
				"extra_data"   = ${provider.cNullableJson(entry.extra_data)}
			WHERE
				"guild_id"     = ${provider.cString(entry.guild_id)} AND
				"case_id"      = ${provider.cNumber(entry.case_id)}
		`);
	}

	public updateModerationLogReasonBulk(guildID: string, cases: readonly number[], reason: string | null) {
		const { provider } = this;
		return this.provider.run(/* sql */`
			UPDATE moderation
			SET
				"reason" = ${reason ? provider.cString(reason) : 'NULL'}
			WHERE
				"guild_id" = ${provider.cString(guildID)} AND
				"case_id" IN (${cases.map(v => provider.cNumber(v)).join(', ')});
		`);
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


	public async upsertTwitchStreamSubscription(streamerID: string, guildID?: string) {
		const returned = await this.provider.runOne<UpsertTwitchStreamReturning>(/* sql */`
			INSERT
			INTO twitch_stream_subscriptions ("id", "is_streaming", "expires_at", "guild_ids")
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (id)
			DO
				UPDATE
				SET guild_ids = ARRAY_CAT(twitch_stream_subscriptions.guild_ids, $4),
					expires_at = $3
			RETURNING guild_ids;
		`, [streamerID, false, Date.now() + (Time.Day * 8), guildID === undefined ? [] : [guildID]]);
		return returned.guild_ids.length === 1;
	}

}

type UpsertMemberSettingsReturning = Pick<RawMemberSettings, 'point_count'>;
type UpsertTwitchStreamReturning = Pick<RawTwitchStreamSubscriptionSettings, 'guild_ids'>;
