/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { GiveawayManager } from '@lib/structures/managers/GiveawayManager';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { Time } from '@utils/constants';
import { api } from '@utils/Models/Api';
import { fetchReactionUsers, resolveEmoji } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Client, DiscordAPIError, HTTPError, MessageEmbed } from 'discord.js';
import { Language } from 'klasa';
import { FetchError } from 'node-fetch';
import { BaseEntity, Check, Column, Entity, PrimaryColumn } from 'typeorm';

const enum States {
	Running,
	LastChance,
	Finished
}

export const kRawEmoji = '🎉';
export const kEmoji = resolveEmoji(kRawEmoji)!;
export const kGiveawayBlockListEditErrors: RESTJSONErrorCodes[] = [
	RESTJSONErrorCodes.UnknownMessage,
	RESTJSONErrorCodes.UnknownChannel,
	RESTJSONErrorCodes.UnknownGuild,
	RESTJSONErrorCodes.MissingAccess,
	RESTJSONErrorCodes.InvalidFormBodyOrContentType
];
export const kGiveawayBlockListReactionErrors: RESTJSONErrorCodes[] = [
	RESTJSONErrorCodes.UnknownMessage,
	RESTJSONErrorCodes.UnknownChannel,
	RESTJSONErrorCodes.UnknownGuild,
	RESTJSONErrorCodes.MissingAccess,
	RESTJSONErrorCodes.UnknownEmoji
];

export type GiveawayEntityData = Pick<GiveawayEntity, 'title' | 'endsAt' | 'guildID' | 'channelID' | 'messageID' | 'minimum' | 'minimumWinners'>;

@Entity('giveaway', { schema: 'public' })
@Check(/* sql */ `"minimum" <> 0`)
@Check(/* sql */ `"minimum_winners" <> 0`)
export class GiveawayEntity extends BaseEntity {
	#client: Client = null!;
	#paused = true;
	#finished = false;
	#refreshAt = 0;
	#winners: string[] | null = null;

	@Column('varchar', { length: 256 })
	public title!: string;

	@Column('timestamp without time zone')
	public endsAt!: Date;

	@PrimaryColumn('varchar', { length: 19 })
	public guildID!: string;

	@Column('varchar', { length: 19 })
	public channelID!: string;

	@PrimaryColumn('varchar', { length: 19 })
	public messageID: string | null = null;

	@Column('integer', { default: 1 })
	public minimum = 1;

	@Column('integer', { default: 1 })
	public minimumWinners = 1;

	public constructor(data: Partial<GiveawayEntityData> = {}) {
		super();
		Object.assign(this, data);
	}

	public setup(manager: GiveawayManager) {
		this.#client = manager.client;
		return this;
	}

	public get guild() {
		return this.#client.guilds.cache.get(this.guildID) ?? null;
	}

	public get language() {
		return this.guild?.language ?? this.#client.languages.default;
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
		if (remaining < Time.Second * 20) return States.LastChance;
		return States.Running;
	}

	public async insert() {
		this.pause();

		// Create the message
		const message = (await api(this.#client)
			.channels(this.channelID)
			.messages.post({ data: await this.getData() })) as { id: string };
		this.messageID = message.id;
		this.resume();

		// Add a reaction to the message and save to database
		await api(this.#client)
			.channels(this.channelID)
			.messages(this.messageID)
			.reactions(kEmoji, '@me')
			.put();

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
		if (this.messageID) {
			try {
				await api(this.#client)
					.channels(this.channelID)
					.messages(this.messageID)
					.delete();
			} catch (error) {
				if (error instanceof DiscordAPIError && kGiveawayBlockListReactionErrors.includes(error.code)) {
					return this;
				}
				this.#client.emit(Events.ApiError, error);
			}
		}

		return this;
	}

	public async render() {
		// Skip early if it's already rendering
		if (this.#paused) return this;

		try {
			await api(this.#client)
				.channels(this.channelID)
				.messages(this.messageID!)
				.patch({ data: await this.getData() });
		} catch (error) {
			if (error instanceof DiscordAPIError && kGiveawayBlockListEditErrors.includes(error.code)) {
				await this.finish();
			} else {
				this.#client.emit(Events.ApiError, error);
			}
		}

		return this;
	}

	private async getData() {
		const { state, language } = this;
		if (state === States.Finished) {
			this.#winners = await this.pickWinners();
			await this.announceWinners(language!);
			await this.finish();
		} else {
			this.#refreshAt = this.calculateNextRefresh();
		}
		const content = GiveawayEntity.getContent(state, language!);
		const embed = this.getEmbed(state, language!);
		return { content, embed };
	}

	private async announceWinners(language: Language) {
		const content = this.#winners
			? language.get(LanguageKeys.Giveaway.EndedMessage, { title: this.title, winners: this.#winners.map((winner) => `<@${winner}>`) })
			: language.get(LanguageKeys.Giveaway.EndedMessageNoWinner, { title: this.title });
		try {
			await api(this.#client)
				.channels(this.channelID)
				.messages.post({ data: { content, allowed_mentions: { users: this.#winners ?? [], roles: [] } } });
		} catch (error) {
			this.#client.emit(Events.ApiError, error);
		}
	}

	private getEmbed(state: States, language: Language) {
		const description = this.getDescription(state, language);
		const footer = GiveawayEntity.getFooter(state, language);
		return new MessageEmbed()
			.setColor(GiveawayEntity.getColor(state))
			.setTitle(this.title)
			.setDescription(description)
			.setFooter(footer)
			.setTimestamp(this.endsAt)
			.toJSON();
	}

	private getDescription(state: States, language: Language) {
		switch (state) {
			case States.Finished:
				return this.#winners?.length
					? language.get(this.#winners.length === 1 ? LanguageKeys.Giveaway.Ended : LanguageKeys.Giveaway.EndedPlural, {
							winners: language.list(
								this.#winners.map((winner) => `<@${winner}>`),
								language.get(LanguageKeys.Globals.And)
							),
							count: this.#winners.length
					  })
					: language.get(LanguageKeys.Giveaway.EndedNoWinner);
			case States.LastChance:
				return language.get(LanguageKeys.Giveaway.Lastchance, { time: this.remaining });
			default:
				return language.get(LanguageKeys.Giveaway.Duration, { time: this.remaining });
		}
	}

	private calculateNextRefresh() {
		const { remaining } = this;
		if (remaining < Time.Second * 5) return Date.now() + Time.Second;
		if (remaining < Time.Second * 30) return Date.now() + Math.min(remaining - Time.Second * 6, Time.Second * 5);
		if (remaining < Time.Minute * 2) return Date.now() + Time.Second * 15;
		if (remaining < Time.Minute * 5) return Date.now() + Time.Second * 20;
		if (remaining < Time.Minute * 15) return Date.now() + Time.Minute;
		if (remaining < Time.Minute * 30) return Date.now() + Time.Minute * 2;
		return Date.now() + Time.Minute * 5;
	}

	private async pickWinners() {
		const participants = await this.fetchParticipants();
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
			const users = await fetchReactionUsers(this.#client, this.channelID, this.messageID!, kEmoji);
			users.delete(CLIENT_ID);
			return [...users];
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === RESTJSONErrorCodes.UnknownMessage || error.code === RESTJSONErrorCodes.UnknownEmoji) return [];
			} else if (error instanceof HTTPError || error instanceof FetchError) {
				if (error.code === 'ECONNRESET') return this.fetchParticipants();
				this.#client.emit(Events.ApiError, error);
			}
			return [];
		}
	}

	private static getContent(state: States, language: Language) {
		switch (state) {
			case States.Finished:
				return language.get(LanguageKeys.Giveaway.EndedTitle);
			case States.LastChance:
				return language.get(LanguageKeys.Giveaway.LastchanceTitle);
			default:
				return language.get(LanguageKeys.Giveaway.Title);
		}
	}

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

	private static getFooter(state: States, language: Language) {
		return state === States.Running ? language.get(LanguageKeys.Giveaway.EndsAt) : language.get(LanguageKeys.Giveaway.EndedAt);
	}
}
