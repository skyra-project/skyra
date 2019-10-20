import { RawStarboardSettings } from '../types/settings/raw/RawStarboardSettings';
import { RawModerationSettings } from '../types/settings/raw/RawModerationSettings';
import { RawGiveawaySettings } from '../types/settings/raw/RawGiveawaySettings';
import { RawMemberSettings } from '../types/settings/raw/RawMemberSettings';

export interface CommonQuery {
	deleteGiveaway(guildID: string, messageID: string): Promise<unknown>;
	deleteMemberSettings(guildID: string, userID: string): Promise<unknown>;
	deleteStar(guildID: string, messageID: string): Promise<unknown>;
	deleteStarReturning(guildID: string, messageID: string): Promise<RawStarboardSettings | null>;
	deleteStarsFromChannelReturning(guildID: string, channelID: string): Promise<RawStarboardSettings[]>;
	deleteStarsReturning(guildID: string, messageIDs: readonly string[]): Promise<RawStarboardSettings[]>;
	fetchGiveawaysFromGuilds(guildIDs: readonly string[]): Promise<RawGiveawaySettings[]>;
	fetchLeaderboardGlobal(): Promise<LeaderboardEntry[]>;
	fetchLeaderboardLocal(guildID: string): Promise<LeaderboardEntry[]>;
	fetchMemberSettings(guildID: string, userID: string): Promise<RawMemberSettings | null>;
	fetchModerationLogByCase(guildID: string, caseNumber: number): Promise<RawModerationSettings | null>;
	fetchModerationLogByCases(guildID: string, caseNumbers: readonly number[]): Promise<RawModerationSettings[]>;
	fetchModerationLogByGuild(guildID: string): Promise<RawModerationSettings[]>;
	fetchModerationLogByUser(guildID: string, user: string): Promise<RawModerationSettings[]>;
	fetchStar(guildID: string, messageID: string): Promise<RawStarboardSettings | null>;
	fetchStarRandom(guildID: string, minimum: number): Promise<RawStarboardSettings | null>;
	fetchStars(guildID: string, minimum: number): Promise<RawStarboardSettings[]>;
	insertCommandUseCounter(command: string): Promise<unknown>;
	insertGiveaway(entry: RawGiveawaySettings): Promise<unknown>;
	insertModerationLog(entry: RawModerationSettings): Promise<unknown>;
	insertStar(entry: RawStarboardSettings): Promise<unknown>;
	updateModerationLog(entry: RawModerationSettings): Promise<unknown>;
	updateStar(entry: RawStarboardSettings): Promise<unknown>;
	upsertDecrementMemberSettings(guildID: string, userID: string, points: number): Promise<number>;
	upsertIncrementMemberSettings(guildID: string, userID: string, points: number): Promise<number>;
	upsertMemberSettings(guildID: string, userID: string, points: number): Promise<number>;
	upsertMemberSettingsDifference(guildID: string, userID: string, points: number): Promise<UpsertMemberSettingsReturningDifference>;
}

export interface LeaderboardEntry {
	user_id: string;
	point_count: number;
}

export interface UpsertMemberSettingsReturningDifference {
	old_value: number | null;
	new_value: number;
}
