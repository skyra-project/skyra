import { DiscordAPIError, HTTPError, MessageEmbed } from 'discord.js';
import { Language } from 'klasa';
import { FetchError } from 'node-fetch';
import { CLIENT_ID } from '../../../config';
import { Databases } from '../types/constants/Constants';
import { Events } from '../types/Enums';
import { TIME } from '../util/constants';
import { fetchReactionUsers, resolveEmoji } from '../util/util';
import { GiveawayManager } from './GiveawayManager';
import { api } from '../util/Models/Api';

enum States {
	Running,
	LastChance,
	Finished
}

export enum Colors {
	Blue = 0x47C7F7,
	Orange = 0xFFA721,
	Red = 0xE80F2B
}

export const GiveawayEmoji = '🎉';

export class Giveaway {

	public store: GiveawayManager;
	public id: string;
	public endsAt: number;
	public refreshAt: number;
	public title: string;
	public minimum: number;
	public minimumWinners: number;
	public messageID: string | null;
	public channelID: string;
	public guildID: string;
	public finished = false;
	private winners: string[] | null = null;
	private paused = false;
	private rendering = false;

	public constructor(store: GiveawayManager, data: GiveawayData) {
		this.store = store;
		this.id = data.id;
		this.title = data.title;
		this.endsAt = data.endsAt;
		this.channelID = data.channelID;
		this.guildID = data.guildID;
		this.messageID = data.messageID || null;
		this.minimum = data.minimum;
		this.minimumWinners = data.minimumWinners;
		this.refreshAt = this.calculateNextRefresh();
	}

	public get guild() {
		return this.store.client.guilds.get(this.guildID) || null;
	}

	public get language() {
		const { guild } = this;
		return guild ? guild!.language : null;
	}

	public get remaining() {
		return Math.max(this.endsAt - Date.now(), 0);
	}

	private get state() {
		const { remaining } = this;
		if (remaining <= 0) return States.Finished;
		if (remaining < TIME.SECOND * 20) return States.LastChance;
		return States.Running;
	}

	public async init() {
		this.pause();

		// Create the message
		const message = await api(this.store.client).channels(this.channelID).messages.post({ data: await this.getData() }) as { id: string };
		this.messageID = message.id;
		this.resume();

		// Add a reaction to the message and save to database
		await api(this.store.client)
			.channels(this.channelID)
			.messages(this.messageID)
			.reactions(Giveaway.EMOJI!, '@me')
			.put();
		await this.store.client.providers.default.create(Databases.Giveaway, this.id, this.toJSON());
		return this;
	}

	public async render() {
		// TODO: Make a promise queue, if there are 1 or more pending edits
		// on heavy ratelimits, skip all of them and unshift the last edit

		// Skip early if it's already rendering
		if (this.paused || this.rendering) return this;
		this.rendering = true;

		try {
			await api(this.store.client)
				.channels(this.channelID)
				.messages(this.messageID!)
				.patch({ data: await this.getData() });
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				// Unknown message | Missing Access | Invalid Form Body
				if (error.code === 10008 || error.code === 50001 || error.code === 50035) {
					await this.destroy();
				} else {
					this.store.client.emit(Events.ApiError, error);
				}
			}
		}

		// Set self rendering to false
		this.rendering = false;
		return this;
	}

	public resume() {
		this.paused = false;
		return this;
	}

	public pause() {
		this.paused = true;
		return this;
	}

	public async finish() {
		this.finished = true;
		await this.store.client.providers.default.delete(Databases.Giveaway, this.id);
		return this;
	}

	public async destroy() {
		await this.finish();
		if (this.messageID) {
			try {
				await api(this.store.client)
					.channels(this.channelID)
					.messages(this.messageID)
					.delete();
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					// Unknown Message | Unknown Emoji
					if (error.code === 10008 || error.code === 10014) return this;
				}
				this.store.client.emit(Events.ApiError, error);
			}
		}
		return this;
	}

	public toJSON(): GiveawayData {
		return {
			channelID: this.channelID,
			endsAt: this.endsAt,
			guildID: this.guildID,
			id: this.id,
			messageID: this.messageID,
			minimum: this.minimum,
			minimumWinners: this.minimumWinners,
			title: this.title
		};
	}

	private async getData() {
		const { state, language } = this;
		if (state === States.Finished) {
			await this.finish();
			this.winners = await this.pickWinners();
			await this.announceWinners(language!);
		} else {
			this.refreshAt = this.calculateNextRefresh();
		}
		const content = this.getContent(state, language!);
		const embed = this.getEmbed(state, language!);
		return { content, embed };
	}

	private async announceWinners(language: Language) {
		const content = this.winners
			? language.tget('GIVEAWAY_ENDED_MESSAGE', this.winners.map(winner => `<@${winner}>`), this.title)
			: language.tget('GIVEAWAY_ENDED_MESSAGE_NO_WINNER', this.title);
		try {
			await api(this.store.client).channels(this.channelID).messages.post({ data: { content } });
		} catch (error) {
			this.store.client.emit(Events.ApiError, error);
		}
	}

	private getEmbed(state: States, language: Language) {
		const description = this.getDescription(state, language);
		const footer = this.getFooter(state, language);
		return new MessageEmbed()
			.setColor(this.getColor(state))
			.setTitle(this.title)
			.setDescription(description)
			.setFooter(footer)
			.setTimestamp(this.endsAt)
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore 2341
			._apiTransform();
	}

	private getContent(state: States, language: Language) {
		switch (state) {
			case States.Finished: return language.tget('GIVEAWAY_ENDED_TITLE');
			case States.LastChance: return language.tget('GIVEAWAY_LASTCHANCE_TITLE');
			default: return language.tget('GIVEAWAY_TITLE');
		}
	}

	private getDescription(state: States, language: Language) {
		switch (state) {
			case States.Finished: return this.winners && this.winners.length
				? language.tget('GIVEAWAY_ENDED', this.winners.map(winner => `<@${winner}>`))
				: language.tget('GIVEAWAY_ENDED_NO_WINNER');
			case States.LastChance: return language.tget('GIVEAWAY_LASTCHANCE', this.remaining);
			default: return language.tget('GIVEAWAY_DURATION', this.remaining);
		}
	}

	private getColor(state: States) {
		switch (state) {
			case States.Finished: return Colors.Red;
			case States.LastChance: return Colors.Orange;
			default: return Colors.Blue;
		}
	}

	private getFooter(state: States, language: Language) {
		return state === States.Running
			? language.tget('GIVEAWAY_ENDS_AT')
			: language.tget('GIVEAWAY_ENDED_AT');
	}

	private calculateNextRefresh() {
		const { remaining } = this;
		if (remaining < TIME.SECOND * 5) return Date.now() + TIME.SECOND;
		if (remaining < TIME.SECOND * 30) return Date.now() + Math.min(remaining - (TIME.SECOND * 6), TIME.SECOND * 5);
		if (remaining < TIME.MINUTE * 2) return Date.now() + (TIME.SECOND * 15);
		if (remaining < TIME.MINUTE * 5) return Date.now() + (TIME.SECOND * 20);
		if (remaining < TIME.MINUTE * 15) return Date.now() + TIME.MINUTE;
		if (remaining < TIME.MINUTE * 30) return Date.now() + (TIME.MINUTE * 2);
		return Date.now() + (TIME.MINUTE * 5);
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
			const users = await fetchReactionUsers(this.store.client, this.channelID, this.messageID!, Giveaway.EMOJI);
			users.delete(CLIENT_ID);
			return [...users];
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				// UNKNOWN_MESSAGE | UNKNOWN_EMOJI
				if (error.code === 10008 || error.code === 10014) return [];
			} else if (error instanceof HTTPError || error instanceof FetchError) {
				if (error.code === 'ECONNRESET') return this.fetchParticipants();
				this.store.client.emit(Events.ApiError, error);
			}
			return [];
		}
	}

	public static EMOJI = resolveEmoji(GiveawayEmoji)!;

}

export interface GiveawayCreateData {
	title: string;
	endsAt: number;
	guildID: string;
	channelID: string;
	minimum: number;
	minimumWinners: number;
}

export interface GiveawayData extends GiveawayCreateData {
	id: string;
	messageID: string | null;
}
