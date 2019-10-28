import { CommonQuery, LeaderboardEntry, UpsertMemberSettingsReturningDifference } from './common';
import { JsonProvider } from '../types/util';
import { Databases } from '../types/constants/Constants';
import { Client } from 'discord.js';
import { RawUserSettings } from '../types/settings/raw/RawUserSettings';
import { RawMemberSettings } from '../types/settings/raw/RawMemberSettings';
import { RawStarboardSettings } from '../types/settings/raw/RawStarboardSettings';
import { RawModerationSettings } from '../types/settings/raw/RawModerationSettings';
import { RawGiveawaySettings } from '../types/settings/raw/RawGiveawaySettings';

export class JsonCommonQuery implements CommonQuery {

	private client: Client;
	private get provider() {
		return this.client.providers.get('json') as JsonProvider;
	}

	public constructor(client: Client) {
		this.client = client;
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

	public fetchModerationLogByCases(guildID: string, caseNumbers: readonly number[]) {
		return this.provider.getAll(Databases.Moderation, caseNumbers.map(caseNumber => `${guildID}.${caseNumber}`)) as Promise<RawModerationSettings[]>;
	}

	public async fetchModerationLogByGuild(guildID: string) {
		const keys = await this.provider.getKeys(Databases.Moderation);
		const filteredKeys = keys.filter(key => key.startsWith(`${guildID}.`));
		if (filteredKeys.length === 0) return [] as RawModerationSettings[];

		return this.provider.getAll(Databases.Moderation, filteredKeys) as Promise<RawModerationSettings[]>;
	}

	public async fetchModerationLogByUser(guildID: string, user: string) {
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

	public async fetchStarRandom(guildID: string, minimum: number) {
		const keys = await this.provider.getKeys(Databases.Starboard);
		const filteredKeys = keys.filter(key => key.startsWith(`${guildID}.`));
		if (filteredKeys.length === 0) return null;

		const values = await this.provider.getAll(Databases.Starboard, filteredKeys) as RawStarboardSettings[];
		const filteredValues = values.filter(value => value.star_message_id !== null && value.enabled && value.stars >= minimum);
		if (filteredValues.length === 0) return null;

		const index = Math.floor(Math.random() * filteredValues.length);
		const value = filteredValues[index];
		return value;
	}

	public async insertCommandUseCounter(command: string) {
		const value = await this.provider.get(Databases.CommandCounter, command) as { id: string; uses: number };
		if (value) await this.provider.update(Databases.CommandCounter, command, { uses: value.uses + 1 });
		else await this.provider.create(Databases.CommandCounter, command, { uses: 1 });
	}

	public insertGiveaway(entry: RawGiveawaySettings) {
		return this.provider.create(Databases.Giveaway, `${entry.guild_id}.${entry.message_id}`, entry);
	}

	public insertModerationLog(entry: RawModerationSettings) {
		return this.provider.create(Databases.Moderation, `${entry.guild_id}.${entry.case_id}`, entry);
	}

	public insertStar(entry: RawStarboardSettings) {
		return this.provider.create(Databases.Moderation, `${entry.guild_id}.${entry.message_id}`, entry);
	}

	public updateModerationLog(entry: RawModerationSettings) {
		return this.provider.update(Databases.Moderation, `${entry.guild_id}.${entry.case_id}`, entry);
	}

	public updateStar(entry: RawStarboardSettings) {
		return this.provider.update(Databases.Starboard, `${entry.guild_id}.${entry.message_id}`, entry);
	}

	public async upsertDecrementMemberSettings(guildID: string, userID: string, points: number) {
		const id = `${guildID}.${userID}`;
		const previous = await this.provider.get(Databases.Members, id) as RawMemberSettings;
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
		const previous = await this.provider.get(Databases.Members, id) as RawMemberSettings;
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

}
