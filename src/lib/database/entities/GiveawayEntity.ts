/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { minutes, seconds } from '#utils/common';
import { Colors } from '#utils/constants';
import { fetchReactionUsers } from '#utils/util';
import { roleMention } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import { APIEmbed, RESTJSONErrorCodes, RESTPatchAPIChannelMessageJSONBody, RESTPostAPIChannelMessageResult } from 'discord-api-types/v9';
import { DiscordAPIError, HTTPError, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import { FetchError } from 'node-fetch';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

const enum States {
	Running,
	LastChance,
	Finished
}

export const kRawEmoji = '🎉';
export const kEmoji = encodeURIComponent(kRawEmoji);
export const kGiveawayBlockListEditErrors: RESTJSONErrorCodes[] = [
	RESTJSONErrorCodes.UnknownMessage,
	RESTJSONErrorCodes.UnknownChannel,
	RESTJSONErrorCodes.UnknownGuild,
	RESTJSONErrorCodes.MissingAccess,
	RESTJSONErrorCodes.InvalidActionOnArchivedThread,
	RESTJSONErrorCodes.InvalidFormBodyOrContentType,
	RESTJSONErrorCodes.ThreadLocked
];
export const kGiveawayBlockListReactionErrors: RESTJSONErrorCodes[] = [
	RESTJSONErrorCodes.UnknownMessage,
	RESTJSONErrorCodes.UnknownChannel,
	RESTJSONErrorCodes.UnknownGuild,
	RESTJSONErrorCodes.MissingAccess,
	RESTJSONErrorCodes.UnknownEmoji,
	RESTJSONErrorCodes.InvalidActionOnArchivedThread,
	RESTJSONErrorCodes.ThreadLocked
];

export type GiveawayEntityData = Pick<
	GiveawayEntity,
	'title' | 'endsAt' | 'guildId' | 'channelId' | 'messageId' | 'minimum' | 'minimumWinners' | 'allowedRoles'
>;

@Entity('giveaway', { schema: 'public' })
export class GiveawayEntity extends BaseEntity {
	#paused = true;
	#finished = false;
	#refreshAt = 0;
	#winners: string[] | null = null;

	@Column('varchar', { length: 256 })
	public title!: string;

	@Column('timestamp without time zone')
	public endsAt!: Date;

	@PrimaryColumn('varchar', { length: 19 })
	public guildId!: string;

	@Column('varchar', { length: 19 })
	public channelId!: string;

	@PrimaryColumn('varchar', { length: 19 })
	public messageId: string | null = null;

	@Column('integer', { default: 1 })
	public minimum = 1;

	@Column('integer', { default: 1 })
	public minimumWinners = 1;

	@Column('varchar', { length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public allowedRoles: string[] = [];

	public constructor(data: Partial<GiveawayEntityData> = {}) {
		super();
		Object.assign(this, data);
	}

	public get guild() {
		return container.client.guilds.cache.get(this.guildId) ?? null;
	}

	public get remaining() {
		return Math.max(this.endsAt.getTime() - Date.now(), 0);
	}

	public get finished() {
		return this.#finished;
	}

	public get refreshAt() {
		return this.#refreshAt;
	}

	private get state() {
		const { remaining } = this;
		if (remaining <= 0) return States.Finished;
		if (remaining < seconds(20)) return States.LastChance;
		return States.Running;
	}

	public async insert() {
		this.pause();

		// Create the message
		const message = (await api()
			.channels(this.channelId)
			.messages.post({ data: await this.getData() })) as RESTPostAPIChannelMessageResult;
		this.messageId = message.id;
		this.resume();

		// Add a reaction to the message and save to database
		await api().channels(this.channelId).messages(this.messageId).reactions(kEmoji, '@me').put();

		return this.save();
	}

	public resume() {
		this.#paused = false;
		return this;
	}

	public pause() {
		this.#paused = true;
		return this;
	}

	public async finish() {
		this.#finished = true;
		await this.remove();
		return this;
	}

	public async destroy() {
		await this.finish();
		if (this.messageId) {
			try {
				await api().channels(this.channelId).messages(this.messageId).delete();
			} catch (error) {
				if (error instanceof DiscordAPIError && kGiveawayBlockListReactionErrors.includes(error.code)) {
					return this;
				}

				container.logger.error(error);
			}
		}

		return this;
	}

	public async render() {
		// Skip early if it's already rendering
		if (this.#paused) return this;

		const data = await this.getData();
		if (data === null) return this.finish();

		try {
			await api().channels(this.channelId).messages(this.messageId!).patch({ data });
		} catch (error) {
			if (error instanceof DiscordAPIError && kGiveawayBlockListEditErrors.includes(error.code)) {
				await this.finish();
			} else {
				container.logger.error(error);
			}
		}

		return this;
	}

	private async getData(): Promise<RESTPatchAPIChannelMessageJSONBody | null> {
		const { state, guild } = this;
		if (!guild) return null;

		const t = await fetchT(guild);
		if (state === States.Finished) {
			this.#winners = await this.pickWinners();
			this.#finished = true;
			await this.announceWinners(t);
		} else {
			this.#refreshAt = this.calculateNextRefresh();
		}
		const content = GiveawayEntity.getContent(state, this.allowedRoles, t);
		// const allowedMentions = GiveawayEntity.getAllowedMentions(state, this.allowedRoles);
		const embed = this.getEmbed(state, t);
		return { content, embed, allowed_mentions: { users: [], roles: [] } };
	}

	private async announceWinners(t: TFunction) {
		const content = this.#winners
			? t(LanguageKeys.Giveaway.EndedMessage, { title: this.title, winners: this.#winners.map((winner) => `<@${winner}>`) })
			: t(LanguageKeys.Giveaway.EndedMessageNoWinner, { title: this.title });
		try {
			await api()
				.channels(this.channelId)
				.messages.post({ data: { content, allowed_mentions: { users: this.#winners ?? [], roles: [] } } });
		} catch (error) {
			container.logger.error(error);
		}
	}

	private getEmbed(state: States, t: TFunction): APIEmbed {
		return new MessageEmbed()
			.setColor(GiveawayEntity.getColor(state))
			.setTitle(this.title)
			.setDescription(this.getDescription(state, t))
			.setFooter(GiveawayEntity.getFooter(state, t))
			.setTimestamp(this.endsAt)
			.toJSON() as APIEmbed;
	}

	private getDescription(state: States, t: TFunction): string {
		switch (state) {
			case States.Finished:
				return this.#winners?.length
					? t(LanguageKeys.Giveaway.Ended, {
							winners: this.#winners.map((winner) => `<@${winner}>`),
							count: this.#winners.length
					  })
					: t(LanguageKeys.Giveaway.EndedNoWinner);
			case States.LastChance:
				return t(LanguageKeys.Giveaway.LastChance, { time: this.remaining });
			default:
				return t(LanguageKeys.Giveaway.Duration, { time: this.remaining });
		}
	}

	private calculateNextRefresh() {
		const { remaining } = this;
		if (remaining < seconds(5)) return Date.now() + seconds(1);
		if (remaining < seconds(30)) return Date.now() + Math.min(remaining - seconds(6), seconds(5));
		if (remaining < minutes(2)) return Date.now() + seconds(15);
		if (remaining < minutes(5)) return Date.now() + seconds(20);
		if (remaining < minutes(15)) return Date.now() + minutes(1);
		if (remaining < minutes(30)) return Date.now() + minutes(2);
		return Date.now() + minutes(5);
	}

	private async pickWinners() {
		const participants = await this.filterParticipants(await this.fetchParticipants());
		if (participants.length < this.minimum) return null;

		let m = participants.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[participants[m], participants[i]] = [participants[i], participants[m]];
		}
		return participants.slice(0, this.minimumWinners);
	}

	private async fetchParticipants(): Promise<string[]> {
		try {
			const users = await fetchReactionUsers(this.channelId, this.messageId!, kEmoji);
			users.delete(process.env.CLIENT_ID);
			return [...users];
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === RESTJSONErrorCodes.UnknownMessage || error.code === RESTJSONErrorCodes.UnknownEmoji) return [];
			} else if (error instanceof HTTPError || error instanceof FetchError) {
				if (error.code === 'ECONNRESET') return this.fetchParticipants();
				container.logger.error(error);
			}
			return [];
		}
	}

	private async filterParticipants(users: string[]): Promise<string[]> {
		// If it's below minimum, there's no point of filtering, return empty array:
		if (users.length < this.minimum) return [];

		const { guild } = this;

		// If the guild is uncached, return empty array:
		if (guild === null) return [];

		// If not all members are cached, fetch all members:
		if (guild.members.cache.size !== guild.memberCount) await guild.members.fetch().catch(() => null);

		const members = guild.members.cache;
		const filtered: string[] = [];
		for (const user of users) {
			const member = members.get(user);

			// If the user is not longer in the guild, skip:
			if (member === undefined) continue;

			// If there is at least one allowed role, and the user doesn't have any of them, skip:
			if (this.allowedRoles.length > 0 && !hasAtLeastOneKeyInMap(member.roles.cache, this.allowedRoles)) continue;

			// Add the user to the list of allowed members:
			filtered.push(user);
		}

		return filtered;
	}

	private static getContent(state: States, roles: string[], t: TFunction): string {
		switch (state) {
			case States.Finished:
				return t(LanguageKeys.Giveaway.EndedTitle);
			case States.LastChance: {
				return t(roles.length ? LanguageKeys.Giveaway.LastChanceTitleWithMentions : LanguageKeys.Giveaway.LastChanceTitle, {
					roles: roles.map((r) => roleMention(r))
				});
			}
			default: {
				return t(roles.length ? LanguageKeys.Giveaway.TitleWithMentions : LanguageKeys.Giveaway.Title, {
					roles: roles.map((r) => roleMention(r))
				});
			}
		}
	}

	// private static getAllowedMentions(state: States, roles: string[]): RESTPatchAPIChannelMessageJSONBody['allowed_mentions'] {
	// 	if (state === States.Finished) return null;

	// 	return { roles };
	// }

	private static getColor(state: States) {
		switch (state) {
			case States.Finished:
				return Colors.Red;
			case States.LastChance:
				return Colors.Orange;
			default:
				return Colors.Blue;
		}
	}

	private static getFooter(state: States, t: TFunction) {
		return state === States.Running ? t(LanguageKeys.Giveaway.EndsAt) : t(LanguageKeys.Giveaway.EndedAt);
	}
}
