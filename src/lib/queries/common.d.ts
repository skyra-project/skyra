import { RawDashboardUserSettings } from '@lib/types/settings/raw/RawDashboardUserSettings';
import { RawGiveawaySettings } from '@lib/types/settings/raw/RawGiveawaySettings';
import { RawMemberSettings } from '@lib/types/settings/raw/RawMemberSettings';
import { RawModerationSettings } from '@lib/types/settings/raw/RawModerationSettings';
import { RawStarboardSettings } from '@lib/types/settings/raw/RawStarboardSettings';
import { RawTwitchStreamSubscriptionSettings } from '@lib/types/settings/raw/RawTwitchStreamSubscriptionSettings';
import { RawRpgGuild, RawRpgGuildRank, RawRpgClass, RawRpgItem } from '@lib/types/settings/raw/RawGameSettings';

export interface CommonQuery {
	deleteUserEntries(userID: string): Promise<unknown>;
	deleteGiveaway(guildID: string, messageID: string): Promise<unknown>;
	deleteMemberSettings(guildID: string, userID: string): Promise<unknown>;
	deleteStar(guildID: string, messageID: string): Promise<unknown>;
	deleteStarReturning(guildID: string, messageID: string): Promise<RawStarboardSettings | null>;
	deleteStarsFromChannelReturning(guildID: string, channelID: string): Promise<RawStarboardSettings[]>;
	deleteStarsReturning(guildID: string, messageIDs: readonly string[]): Promise<RawStarboardSettings[]>;
	deleteTwitchStreamSubscription(streamerID: string, guildID: string): Promise<boolean>;
	deleteTwitchStreamSubscriptions(streamers: readonly string[]): Promise<unknown>;
	purgeTwitchStreamGuildSubscriptions(guildID: string): Promise<UpdatePurgeTwitchStreamReturning[]>;
	fetchDashboardUser(id: string): Promise<DashboardUser | null>;
	fetchGiveawaysFromGuilds(guildIDs: readonly string[]): Promise<RawGiveawaySettings[]>;
	fetchLeaderboardGlobal(): Promise<LeaderboardEntry[]>;
	fetchLeaderboardLocal(guildID: string): Promise<LeaderboardEntry[]>;
	fetchMemberSettings(guildID: string, userID: string): Promise<RawMemberSettings | null>;
	fetchModerationLogByCase(guildID: string, caseNumber: number): Promise<RawModerationSettings | null>;
	fetchModerationLogsByCases(guildID: string, caseNumbers: readonly number[]): Promise<RawModerationSettings[]>;
	fetchModerationLogsByGuild(guildID: string): Promise<RawModerationSettings[]>;
	fetchModerationLogsByUser(guildID: string, user: string): Promise<RawModerationSettings[]>;
	fetchStar(guildID: string, messageID: string): Promise<RawStarboardSettings | null>;
	fetchStarRandom(guildID: string, minimum: number): Promise<RawStarboardSettings | null>;
	fetchStarRandomFromUser(guildID: string, userID: string, minimum: number): Promise<RawStarboardSettings | null>;
	fetchStars(guildID: string, minimum: number): Promise<RawStarboardSettings[]>;
	fetchStarsFromUser(guildID: string, userID: string, minimum: number): Promise<RawStarboardSettings[]>;
	fetchTwitchStreamSubscription(streamerID: string): Promise<TwitchStreamSubscriptionSettings | null>;
	fetchTwitchStreamsByGuild(guildID: string): Promise<TwitchStreamSubscriptionSettings[]>;
	insertCommandUseCounter(command: string): Promise<unknown>;
	insertDashboardUser(entry: RawDashboardUserSettings): Promise<unknown>;
	insertGiveaway(entry: RawGiveawaySettings): Promise<unknown>;
	insertModerationLog(entry: RawModerationSettings): Promise<unknown>;
	insertStar(entry: RawStarboardSettings): Promise<unknown>;
	updateModerationLog(entry: RawModerationSettings): Promise<unknown>;
	updateModerationLogReasonBulk(guildID: string, cases: readonly number[], reason: string | null): Promise<unknown>;
	updateStar(entry: RawStarboardSettings): Promise<unknown>;
	upsertDecrementMemberSettings(guildID: string, userID: string, points: number): Promise<number>;
	upsertIncrementMemberSettings(guildID: string, userID: string, points: number): Promise<number>;
	upsertMemberSettings(guildID: string, userID: string, points: number): Promise<number>;
	upsertMemberSettingsDifference(guildID: string, userID: string, points: number): Promise<UpsertMemberSettingsReturningDifference>;
	upsertTwitchStreamSubscription(streamerID: string, guildID: string, expireSeconds?: number): Promise<boolean>;
}

export interface DashboardUser {
	id: string;
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
}

export interface LeaderboardEntry {
	user_id: string;
	point_count: number;
}

export interface UpsertMemberSettingsReturningDifference {
	old_value: number | null;
	new_value: number;
}

export interface RpgUserEntryItem extends RawRpgItem {
	durability: string;
}

export interface RpgUserEntry {
	id: string;
	name: string;
	win_count: string;
	guild: RawRpgGuild | null;
	guild_rank: RawRpgGuildRank | null;
	class: RawRpgClass | null;
	items: RpgUserEntryItem[];
	death_count: string;
	crate_common_count: number;
	crate_uncommon_count: number;
	crate_rare_count: number;
	crate_legendary_count: number;
	luck: number;
}

export interface TwitchStreamSubscriptionSettings {
	id: string;
	is_streaming: boolean;
	expires_at: number;
	guild_ids: string[];
}

export type UpdatePurgeTwitchStreamReturning = Pick<RawTwitchStreamSubscriptionSettings, 'id' | 'guild_ids'>;
