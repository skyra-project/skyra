import { Databases } from '@lib/types/constants/Constants';
import type { RawDashboardUserSettings } from '@lib/types/settings/raw/RawDashboardUserSettings';
import type { RawRpgItem } from '@lib/types/settings/raw/RawGameSettings';
import type { RawGiveawaySettings } from '@lib/types/settings/raw/RawGiveawaySettings';
import type { RawMemberSettings } from '@lib/types/settings/raw/RawMemberSettings';
import type { RawModerationSettings } from '@lib/types/settings/raw/RawModerationSettings';
import type { RawStarboardSettings } from '@lib/types/settings/raw/RawStarboardSettings';
import type { RawSuggestionSettings } from '@lib/types/settings/raw/RawSuggestionsSettings';
import type { RawTwitchStreamSubscriptionSettings } from '@lib/types/settings/raw/RawTwitchStreamSubscriptionSettings';
import type { RawUserSettings } from '@lib/types/settings/raw/RawUserSettings';
import { JsonProvider } from '@lib/types/util';
import { Time } from '@utils/constants';
import type { Client } from 'discord.js';
import type { CommonQuery, LeaderboardEntry, TwitchStreamSubscriptionSettings, UpdatePurgeTwitchStreamReturning, UpsertMemberSettingsReturningDifference } from './common';

export class JsonCommonQuery implements CommonQuery {

	private client: Client;
	private get provider() {
		return this.client.providers.get(this.client.options.providers.default === 'json' ? 'json' : 'cache') as JsonProvider;
	}

	public constructor(client: Client) {
		this.client = client;
	}

	public async deleteUserEntries(userID: string) {
		const { provider } = this;

		const userData = await provider.get(Databases.Users, userID) as RawUserSettings | null;
		if (userData !== null) {
			for (const marry of userData.marry) {
				const temp = await provider.get(Databases.Users, marry) as RawUserSettings | null;
				if (temp !== null) await provider.update(Databases.Users, marry, { marry: temp.marry.filter(m => m !== userID) });
			}

			// Prune user entry
			await provider.delete(Databases.Users, userID);
		}

		// Prune all member entries
		for (const key of await provider.getKeys(Databases.Members)) {
			if (key.endsWith(`.${userID}`)) await provider.delete(Databases.Members, key);
		}
	}

	public async deleteGiveaway(guildID: string, messageID: string) {
		await this.provider.delete(Databases.Giveaway, `${guildID}.${messageID}`);
	}

	public async deleteMemberSettings(guildID: string, userID: string) {
		await this.provider.delete(Databases.Members, `${guildID}.${userID}`);
	}

	public deleteStar(guildID: string, messageID: string) {
		return this.provider.delete(Databases.Starboard, `${guildID}.${messageID}`);
	}

	public async deleteStarReturning(guildID: string, messageID: string) {
		const id = `${guildID}.${messageID}`;
		const entry = await this.provider.get(Databases.Starboard, id) as RawStarboardSettings | null;
		if (entry) await this.provider.delete(Databases.Starboard, id);
		return entry;
	}

	public async deleteStarsFromChannelReturning(guildID: string, channelID: string) {
		const keys = await this.provider.getKeys(Databases.Starboard);
		const filteredKeys = keys.filter(key => key.startsWith(`${guildID}.`));
		if (filteredKeys.length === 0) return [];

		const values = await this.provider.getAll(Databases.Starboard, filteredKeys) as RawStarboardSettings[];
		const filteredValues = values.filter(value => value.channel_id === channelID);
		if (filteredValues.length === 0) return [];

		await Promise.all(filteredValues.map(value => this.provider.delete(Databases.Starboard, `${guildID}.${value.message_id}`)));
		return filteredValues;
	}

	public async deleteStarsReturning(guildID: string, messageIDs: readonly string[]) {
		const keys = messageIDs.map(messageID => `${guildID}.${messageID}`);
		const values = await this.provider.getAll(Databases.Starboard, keys) as RawStarboardSettings[];
		if (values.length === 0) return [];

		await Promise.all(values.map(value => this.provider.delete(Databases.Starboard, `${guildID}.${value.message_id}`)));
		return values;
	}

	public deleteSuggestion(guildID: string, suggestionID: number) {
		return this.provider.delete(Databases.Suggestions, `${guildID}.${suggestionID}`);
	}

	public async deleteTwitchStreamSubscription(streamerID: string, guildID: string) {
		const entry = await this.provider.get<RawTwitchStreamSubscriptionSettings>(Databases.TwitchStreamSubscriptions, streamerID);
		if (!entry) return false;
		entry.guild_ids = entry.guild_ids.filter(value => value !== guildID);
		await this.provider.update(Databases.TwitchStreamSubscriptions, streamerID, entry);
		return entry.guild_ids.length === 0;
	}

	public deleteTwitchStreamSubscriptions(streamers: readonly string[]) {
		return Promise.all(streamers.map(streamer => this.provider.delete(Databases.TwitchStreamSubscriptions, streamer)));
	}

	public async purgeTwitchStreamGuildSubscriptions(guildID: string) {
		const updates: Promise<UpdatePurgeTwitchStreamReturning>[] = [];
		const values = await this.provider.getAll(Databases.TwitchStreamSubscriptions) as RawTwitchStreamSubscriptionSettings[];
		if (values.length === 0) return [];

		for (const streamer of values) {
			if (!streamer.guild_ids.includes(guildID)) continue;
			streamer.guild_ids = streamer.guild_ids.filter(value => value !== guildID);
			updates.push(this.provider.update(Databases.TwitchStreamSubscriptions, streamer.id, streamer)
				.then(() => ({ id: streamer.id, guild_ids: streamer.guild_ids })));
		}

		return Promise.all(updates);
	}

	public async fetchDashboardUser(id: string) {
		const raw = await this.provider.get(Databases.DashboardUsers, id) as RawDashboardUserSettings | null;
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

	public async fetchGiveawaysFromGuilds(guildIDs: readonly string[]) {
		const ids = guildIDs.map(guildID => `${guildID}.`);
		const keys = await this.provider.getKeys(Databases.Giveaway);
		const filteredKeys = keys.filter(key => ids.some(id => key.startsWith(id)));
		if (filteredKeys.length === 0) return [];

		return this.provider.getAll(Databases.Giveaway, filteredKeys) as Promise<RawGiveawaySettings[]>;
	}

	public async fetchLeaderboardGlobal() {
		const values = await this.provider.getAll(Databases.Users) as RawUserSettings[];
		return values
			.filter(value => value.point_count >= 25)
			.sort((a, b) => a.point_count < b.point_count ? -1 : 1)
			.slice(0, 25000)
			.map(value => ({ user_id: value.id, point_count: value.point_count }) as LeaderboardEntry);
	}

	public async fetchLeaderboardLocal(guildID: string) {
		const keys = await this.provider.getKeys(Databases.Members);
		const filteredKeys = keys.filter(key => key.startsWith(`${guildID}.`));
		if (filteredKeys.length === 0) return [];

		const values = await this.provider.getAll(Databases.Members, filteredKeys) as RawMemberSettings[];
		return values
			.filter(value => value.point_count >= 25)
			.sort((a, b) => a.point_count < b.point_count ? -1 : 1)
			.slice(0, 5000)
			.map(value => ({ user_id: value.user_id, point_count: value.point_count }) as LeaderboardEntry);
	}

	public fetchMemberSettings(guildID: string, userID: string) {
		return this.provider.get(Databases.Members, `${guildID}.${userID}`) as Promise<RawMemberSettings | null>;
	}

	public fetchModerationLogByCase(guildID: string, caseNumber: number) {
		return this.provider.get(Databases.Moderation, `${guildID}.${caseNumber}`) as Promise<RawModerationSettings>;
	}

	public fetchModerationLogsByCases(guildID: string, caseNumbers: readonly number[]) {
		return this.provider.getAll(Databases.Moderation, caseNumbers.map(caseNumber => `${guildID}.${caseNumber}`)) as Promise<RawModerationSettings[]>;
	}

	public async fetchModerationLogsByGuild(guildID: string) {
		const keys = await this.provider.getKeys(Databases.Moderation);
		const filteredKeys = keys.filter(key => key.startsWith(`${guildID}.`));
		if (filteredKeys.length === 0) return [] as RawModerationSettings[];

		return this.provider.getAll(Databases.Moderation, filteredKeys) as Promise<RawModerationSettings[]>;
	}

	public async fetchModerationLogsByUser(guildID: string, user: string) {
		const keys = await this.provider.getKeys(Databases.Moderation);
		const filteredKeys = keys.filter(key => key.startsWith(`${guildID}.`));
		if (filteredKeys.length === 0) return [] as RawModerationSettings[];

		const values = await this.provider.getAll(Databases.Moderation, filteredKeys) as RawModerationSettings[];
		return values.filter(value => value.user_id === user);
	}

	public fetchStar(guildID: string, messageID: string) {
		return this.provider.get(Databases.Starboard, `${guildID}.${messageID}`) as Promise<RawStarboardSettings>;
	}

	public async fetchStars(guildID: string, minimum: number) {
		const keys = await this.provider.getKeys(Databases.Starboard);
		const filteredKeys = keys.filter(key => key.startsWith(`${guildID}.`));
		if (filteredKeys.length === 0) return [];

		const values = await this.provider.getAll(Databases.Starboard, filteredKeys) as RawStarboardSettings[];
		return values.filter(value => value.star_message_id !== null && value.enabled && value.stars >= minimum);
	}

	public async fetchStarsFromUser(guildID: string, userID: string, minimum: number) {
		const keys = await this.provider.getKeys(Databases.Starboard);
		const filteredKeys = keys.filter(key => key.startsWith(`${guildID}.`));
		if (filteredKeys.length === 0) return [];

		const values = await this.provider.getAll(Databases.Starboard, filteredKeys) as RawStarboardSettings[];
		return values.filter(value => value.star_message_id !== null && value.enabled && value.user_id === userID && value.stars >= minimum);
	}

	public async fetchStarRandom(guildID: string, minimum: number) {
		const values = await this.fetchStars(guildID, minimum);
		if (values.length === 0) return null;

		const index = Math.floor(Math.random() * values.length);
		return values[index];
	}

	public async fetchStarRandomFromUser(guildID: string, userID: string, minimum: number) {
		const values = await this.fetchStarsFromUser(guildID, userID, minimum);
		if (values.length === 0) return null;

		const index = Math.floor(Math.random() * values.length);
		return values[index];
	}

	public async fetchSuggestion(guildID: string, suggestionID: number) {
		return this.provider.get(Databases.Suggestions, `${guildID}.${suggestionID}`) as Promise<RawSuggestionSettings | null>;
	}

	public fetchTwitchStreamSubscription(streamerID: string) {
		return this.provider.get(Databases.TwitchStreamSubscriptions, streamerID) as Promise<TwitchStreamSubscriptionSettings | null>;
	}

	public async fetchTwitchStreamsByGuild(guildID: string) {
		const values = await this.provider.getAll(Databases.TwitchStreamSubscriptions) as TwitchStreamSubscriptionSettings[];
		return values.filter(value => value.guild_ids.includes(guildID));
	}

	public async fetchAllTwitchStreams() {
		return await this.provider.getAll(Databases.TwitchStreamSubscriptions) as TwitchStreamSubscriptionSettings[];
	}

	public async retrieveRandomItem(luck: number) {
		const entries = (await this.provider.getAll(Databases.RpgItems) as RawRpgItem[])
			.sort((a, b) => a.id - b.id);

		const count = entries.reduce((acc, entry) => acc + Number(entry.rarity), 0);
		const percentage = luck === 0 ? 1 : 1 / luck;
		const maximum = Math.random() * count * percentage;

		let counter = 0;
		for (const entry of entries) {
			counter += Number(entry.rarity);
			if (counter >= maximum) return entry;
		}

		return entries[entries.length - 1];
	}

	public async insertCommandUseCounter(command: string) {
		const value = await this.provider.get(Databases.CommandCounter, command) as { id: string; uses: number };
		if (value) await this.provider.update(Databases.CommandCounter, command, { uses: value.uses + 1 });
		else await this.provider.create(Databases.CommandCounter, command, { uses: 1 });
	}

	public insertDashboardUser(entry: RawDashboardUserSettings) {
		return this.provider.create(Databases.DashboardUsers, entry.id, entry);
	}

	public insertGiveaway(entry: RawGiveawaySettings) {
		return this.provider.create(Databases.Giveaway, `${entry.guild_id}.${entry.message_id}`, entry);
	}

	public async fetchModerationCurrentCaseID(guildID: string) {
		const prefix = `${guildID}.`;
		const length = guildID.length + 1;

		let highest: null | number = null;
		for (const key of await this.provider.getKeys(Databases.Moderation)) {
			if (!key.startsWith(prefix)) continue;
			const caseID = Number(key.slice(length));
			if (Number.isNaN(caseID)) continue;

			if (highest === null || caseID > highest) highest = caseID;
		}

		return highest === null ? 0 : highest;
	}

	public insertModerationLog(entry: RawModerationSettings) {
		return this.provider.create(Databases.Moderation, `${entry.guild_id}.${entry.case_id}`, entry);
	}

	public insertStar(entry: RawStarboardSettings) {
		return this.provider.create(Databases.Moderation, `${entry.guild_id}.${entry.message_id}`, entry);
	}

	public async insertRpgGuild(leaderID: string, name: string) {
		// Retrieve counter from "meta" entry in database
		let meta = await this.provider.get(Databases.RpgGuilds, 'meta') as RpgGuildMetaEntry | null;
		if (meta === null) {
			meta = { id: 'meta', counter: 1 };
			await this.provider.create(Databases.RpgGuilds, 'meta', meta);
		} else {
			++meta.counter;
			await this.provider.update(Databases.RpgGuilds, 'meta', meta);
		}

		// Create the guild data and update information
		const id = meta.counter;
		await Promise.all([
			this.provider.create(Databases.RpgGuilds, `${id}`, {
				id,
				name,
				description: null,
				leader: leaderID,
				member_limit: 5,
				win_count: 0,
				lose_count: 0,
				money_count: 0,
				bank_limit: 50000,
				upgrade: 0
			}),
			this.provider.update(Databases.RpgUsers, leaderID, { guild_id: id })
		]);
	}

	public insertSuggestion(entry: RawSuggestionSettings) {
		return this.provider.create(Databases.Suggestions, `${entry.guild_id}.${entry.id}`, entry);
	}

	public updateModerationLog(entry: RawModerationSettings) {
		return this.provider.update(Databases.Moderation, `${entry.guild_id}.${entry.case_id}`, entry);
	}

	public updateModerationLogReasonBulk(guildID: string, cases: readonly number[], reason: string | null) {
		return Promise.all(cases.map(cs => this.provider.update(Databases.Moderation, `${guildID}.${cs}`, { reason })));
	}

	public updateStar(entry: RawStarboardSettings) {
		return this.provider.update(Databases.Starboard, `${entry.guild_id}.${entry.message_id}`, entry);
	}

	public async upsertDecrementMemberSettings(guildID: string, userID: string, points: number) {
		const id = `${guildID}.${userID}`;
		const previous = await this.provider.get<RawMemberSettings>(Databases.Members, id);
		const patched: RawMemberSettings = {
			guild_id: guildID,
			user_id: userID,
			point_count: previous ? Math.max(0, previous.point_count - points) : 0
		};
		if (previous) await this.provider.replace(Databases.Members, id, patched);
		else await this.provider.create(Databases.Members, id, patched);
		return patched.point_count;
	}

	public async upsertIncrementMemberSettings(guildID: string, userID: string, points: number) {
		const id = `${guildID}.${userID}`;
		const previous = await this.provider.get<RawMemberSettings>(Databases.Members, id);
		const patched: RawMemberSettings = {
			guild_id: guildID,
			user_id: userID,
			point_count: previous ? previous.point_count + points : points
		};
		if (previous) await this.provider.replace(Databases.Members, id, patched);
		else await this.provider.create(Databases.Members, id, patched);
		return patched.point_count;
	}

	public async upsertMemberSettings(guildID: string, userID: string, points: number) {
		const id = `${guildID}.${userID}`;
		const patched: RawMemberSettings = {
			guild_id: guildID,
			user_id: userID,
			point_count: points
		};
		await this.provider.replace(Databases.Members, id, patched);
		return patched.point_count;
	}

	public async upsertMemberSettingsDifference(guildID: string, userID: string, points: number): Promise<UpsertMemberSettingsReturningDifference> {
		const id = `${guildID}.${userID}`;
		const patched: RawMemberSettings = {
			guild_id: guildID,
			user_id: userID,
			point_count: points
		};
		const previous = await this.provider.get(Databases.Members, id) as RawMemberSettings | null;
		await this.provider.replace(Databases.Members, id, patched);
		return {
			old_value: previous ? previous.point_count : null,
			new_value: patched.point_count
		};
	}

	public async upsertTwitchStreamSubscription(streamerID: string, guildID?: string) {
		const value = await this.provider.get<RawTwitchStreamSubscriptionSettings>(Databases.TwitchStreamSubscriptions, streamerID);
		if (value) {
			// When updating Twitch subscriptions the GuildID is passed as `undefined`
			const guild_ids = guildID === undefined ? value.guild_ids : value.guild_ids.concat(guildID);
			await this.provider.update(
				Databases.TwitchStreamSubscriptions, streamerID,
				{ ...value, expires_at: Date.now() + (Time.Day * 8), guild_ids }
			);
			return guild_ids.length === 1;
		}

		await this.provider.create(Databases.TwitchStreamSubscriptions, streamerID, {
			id: streamerID,
			is_streaming: false,
			expires_at: Date.now() + (Time.Day * 8),
			// When inserting new Twitch subscriptions a GuildID is always given
			guild_ids: [guildID]
		});
		return true;
	}

}

interface RpgGuildMetaEntry {
	id: string;
	counter: number;
}
