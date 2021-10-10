/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import type { SerializedEmoji } from '#utils/functions';
import { fetchReactionUsers } from '#utils/util';
import { Embed, FooterOptions, roleMention, time, TimestampStyles, userMention } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { hasAtLeastOneKeyInMap, isNullish } from '@sapphire/utilities';
import {
	APIAllowedMentions,
	APIEmbed,
	PermissionFlagsBits,
	RESTJSONErrorCodes,
	RESTPatchAPIChannelMessageJSONBody,
	RESTPostAPIChannelMessageResult,
	Snowflake
} from 'discord-api-types/v9';
import { DiscordAPIError, HTTPError } from 'discord.js';
import type { TFunction } from 'i18next';
import { FetchError } from 'node-fetch';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

export const rawGiveawayEmoji = '🎉';
export const encodedGiveawayEmoji = encodeURIComponent(rawGiveawayEmoji) as SerializedEmoji;
export const giveawayBlockListEditErrors: RESTJSONErrorCodes[] = [
	RESTJSONErrorCodes.UnknownMessage,
	RESTJSONErrorCodes.UnknownChannel,
	RESTJSONErrorCodes.UnknownGuild,
	RESTJSONErrorCodes.MissingAccess,
	RESTJSONErrorCodes.InvalidActionOnArchivedThread,
	RESTJSONErrorCodes.InvalidFormBodyOrContentType,
	RESTJSONErrorCodes.ThreadLocked
];
export const giveawayBlockListReactionErrors: RESTJSONErrorCodes[] = [
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
	'title' | 'endsAt' | 'guildId' | 'channelId' | 'messageId' | 'authorId' | 'minimum' | 'minimumWinners' | 'allowedRoles'
>;

@Entity('giveaway', { schema: 'public' })
export class GiveawayEntity extends BaseEntity {
	#paused = true;
	#endHandled = false;
	#winners: string[] | null = null;

	@Column('varchar', { length: 256 })
	public title!: string;

	@Column('timestamp without time zone')
	public endsAt!: Date;

	@PrimaryColumn('varchar', { length: 19 })
	public guildId!: Snowflake;

	@Column('varchar', { length: 19 })
	public channelId!: Snowflake;

	@PrimaryColumn('varchar', { length: 19 })
	public messageId: Snowflake | null = null;

	@Column('varchar', { length: 19 })
	public authorId: Snowflake | null = null;

	@Column('integer', { default: 1 })
	public minimum = 1;

	@Column('integer', { default: 1 })
	public minimumWinners = 1;

	@Column('varchar', { length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public allowedRoles: Snowflake[] = [];

	public constructor(data: Partial<GiveawayEntityData> = {}) {
		super();
		Object.assign(this, data);
	}

	public get guild() {
		return container.client.guilds.cache.get(this.guildId) ?? null;
	}

	public get endHandled() {
		return this.#endHandled;
	}

	private get ended() {
		return this.endsAt.getTime() <= Date.now();
	}

	public async fetchAuthor() {
		if (!this.authorId) return null;

		const { guild } = this;
		if (!guild) return null;

		return guild.members.fetch(this.authorId).catch(() => null);
	}

	public async insert() {
		this.pause();

		// Create the message
		const message = (await api()
			.channels(this.channelId)
			.messages.post({ data: await this.getMessageBody() })) as RESTPostAPIChannelMessageResult;
		this.messageId = message.id;
		this.resume();

		// Add a reaction to the message and save to database
		await api().channels(this.channelId).messages(this.messageId).reactions(encodedGiveawayEmoji, '@me').put();

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
		this.#endHandled = true;
		await this.remove();
		return this;
	}

	public async destroy() {
		await this.finish();
		if (this.messageId) {
			try {
				await api().channels(this.channelId).messages(this.messageId).delete();
			} catch (error) {
				if (error instanceof DiscordAPIError && giveawayBlockListReactionErrors.includes(error.code)) {
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

		const data = await this.getMessageBody();
		if (data === null) return this.finish();

		try {
			await api().channels(this.channelId).messages(this.messageId!).patch({ data });
		} catch (error) {
			if (error instanceof DiscordAPIError && giveawayBlockListEditErrors.includes(error.code)) {
				await this.finish();
			} else {
				container.logger.error(error);
			}
		}

		return this;
	}

	private async announceWinners(t: TFunction) {
		const content = this.#winners
			? t(LanguageKeys.Giveaway.EndedMessage, { title: this.title, winners: this.#winners.map(userMention) })
			: t(LanguageKeys.Giveaway.EndedMessageNoWinner, { title: this.title });
		try {
			await api()
				.channels(this.channelId)
				.messages.post({ data: { content, allowed_mentions: { users: this.#winners ?? [], roles: [] } } });
		} catch (error) {
			container.logger.error(error);
		}
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
			const users = await fetchReactionUsers(this.channelId, this.messageId!, encodedGiveawayEmoji);
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

	private async getMessageBody(): Promise<RESTPatchAPIChannelMessageJSONBody | null> {
		const { ended, guild } = this;
		if (!guild) return null;

		const t = await fetchT(guild);
		if (ended) {
			this.#winners = await this.pickWinners();
			this.#endHandled = true;
			await this.announceWinners(t);
		}

		const content = this.getMessageContent(ended, this.allowedRoles, t);
		const allowedMentions = await this.fetchAllowedMentions();
		const embed = this.getMessageEmbed(ended, t);
		return { content, embed, allowed_mentions: allowedMentions };
	}

	private getMessageContent(ended: boolean, roles: string[], t: TFunction): string {
		if (ended) return t(LanguageKeys.Giveaway.EndedTitle);

		const key = roles.length ? LanguageKeys.Giveaway.TitleWithMentions : LanguageKeys.Giveaway.Title;
		return t(key, { roles: roles.map(roleMention), count: roles.length });
	}

	private async fetchAllowedMentions(): Promise<APIAllowedMentions> {
		const roles: Snowflake[] = [];
		if (this.allowedRoles.length === 0) return { roles };

		const member = await this.fetchAuthor();
		if (member === null) return { roles };

		const canMentionAnyway = member.permissions.has(PermissionFlagsBits.MentionEveryone);
		for (const roleId of this.allowedRoles) {
			const role = member.guild.roles.cache.get(roleId);
			if (isNullish(role)) continue;
			if (canMentionAnyway || role.mentionable) roles.push(roleId);
		}

		return { roles };
	}

	private getMessageEmbed(ended: boolean, t: TFunction): APIEmbed {
		return new Embed()
			.setColor(this.getMessageEmbedColor(ended))
			.setTitle(this.title)
			.setDescription(this.getMessageEmbedDescription(ended, t))
			.setFooter(this.getMessageEmbedFooter(ended, t))
			.setTimestamp(this.endsAt);
	}

	private getMessageEmbedColor(ended: boolean) {
		return ended ? Colors.Red : Colors.Blue;
	}

	private getMessageEmbedDescription(ended: boolean, t: TFunction): string {
		const lines = [ended ? this.getMessageEmbedDescriptionEnded(t) : this.getMessageEmbedDescriptionRunning(t)];
		if (this.authorId) lines.push(t(LanguageKeys.Giveaway.EmbedHostedBy, { user: userMention(this.authorId) }));
		return lines.join('\n');
	}

	private getMessageEmbedDescriptionEnded(t: TFunction) {
		if (!this.#winners?.length) {
			return t(LanguageKeys.Giveaway.EndedNoWinner);
		}

		const winners = this.#winners.map(userMention);
		return t(LanguageKeys.Giveaway.Ended, { winners, count: winners.length });
	}

	private getMessageEmbedDescriptionRunning(t: TFunction) {
		return t(LanguageKeys.Giveaway.Duration, { timestamp: time(this.endsAt, TimestampStyles.RelativeTime) });
	}

	private getMessageEmbedFooter(ended: boolean, t: TFunction): FooterOptions {
		return { text: ended ? t(LanguageKeys.Giveaway.EndedAt) : t(LanguageKeys.Giveaway.EndsAt) };
	}
}
