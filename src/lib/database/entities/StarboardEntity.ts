/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { GuildSettings } from '@lib/database';
import { isNullish } from '@lib/misc';
import { StarboardManager } from '@lib/structures/managers/StarboardManager';
import { GuildMessage } from '@lib/types';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { cutText } from '@sapphire/utilities';
import { debounce } from '@utils/debounce';
import { fetchReactionUsers, getImage } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Client, DiscordAPIError, HTTPError, MessageEmbed, TextChannel } from 'discord.js';
import { Language } from 'klasa';
import { BaseEntity, Check, Column, Entity, PrimaryColumn } from 'typeorm';

export const kColors = [
	0xffe3af,
	0xffe0a5,
	0xffdd9c,
	0xffdb92,
	0xffd889,
	0xffd57f,
	0xffd275,
	0xffcf6b,
	0xffcc61,
	0xffca57,
	0xffc74c,
	0xffc440,
	0xffc133,
	0xffbe23,
	0xffbb09
];

export const kMaxColors = kColors.length - 1;

@Check('stars >= 0')
@Entity('starboard', { schema: 'public' })
export class StarboardEntity extends BaseEntity {
	#users = new Set<string>();
	#manager: StarboardManager = null!;
	#client: Client = null!;
	#message: GuildMessage = null!;
	#starMessage: GuildMessage | null = null;
	#updateStarMessage = debounce(this.updateStarMessage.bind(this), { wait: 2500, maxWait: 10000 });

	@Column('boolean')
	public enabled = true;

	@Column('varchar', { length: 19 })
	public userID: string = null!;

	@PrimaryColumn('varchar', { length: 19 })
	public messageID: string = null!;

	@Column('varchar', { length: 19 })
	public channelID: string = null!;

	@PrimaryColumn('varchar', { length: 19 })
	public guildID: string = null!;

	@Column('varchar', { nullable: true, length: 19 })
	public starMessageID: string | null = null;

	@Column('integer')
	public stars = 0;

	/**
	 * The last time it got updated
	 */
	public lastUpdated = Date.now();

	/**
	 * The emoji to use
	 */
	private get emoji() {
		const { stars } = this;
		if (stars < 5) return '⭐';
		if (stars < 10) return '🌟';
		if (stars < 25) return '💫';
		if (stars < 100) return '✨';
		if (stars < 200) return '🌠';
		return '🌌';
	}

	/**
	 * The color for the embed
	 */
	private get color() {
		return kColors[Math.min(this.stars, kMaxColors)];
	}

	public setup(manager: StarboardManager, message: GuildMessage) {
		this.#client = manager.client;
		this.#manager = manager;
		this.#message = message;
		this.messageID = message.id;
		this.channelID = message.channel.id;
		this.guildID = manager.guild.id;
		this.userID = message.author.id;
		return this;
	}

	/**
	 * Disable this StarboardMessage, pausing the star retrieval
	 */
	public async disable(): Promise<boolean> {
		if (!this.enabled) return false;
		await this.edit({ enabled: false });
		return true;
	}

	/**
	 * Enables this StarboardMessage, resuming the star retrieval
	 */
	public async enable(): Promise<boolean> {
		if (this.enabled) return false;
		await this.edit({ enabled: true });
		await this.downloadUserList();
		return true;
	}

	/**
	 * Add a new user to the list
	 * @param id The user's ID to add
	 */
	public async increment(id: string, selfStarring: boolean): Promise<void> {
		if (this.#message.author.id === id && !selfStarring) return;
		this.#users.add(id);
		await this.edit({ stars: this.#users.size });
	}

	/**
	 * Remove a user to the list
	 * @param id The user's ID to remove
	 */
	public async decrement(id: string): Promise<void> {
		this.#users.delete(id);
		await this.edit({ stars: this.#users.size });
	}

	/**
	 * Save data to the database
	 * @param options The options
	 */
	public async edit(options: Partial<StarboardEntity>): Promise<this> {
		this.lastUpdated = Date.now();

		// If a message was in progress to be sent, await it first
		const previousUpdate = this.#manager.syncMessageMap.get(this);
		if (previousUpdate) await previousUpdate;

		if (Reflect.has(options, 'enabled')) {
			this.enabled = options.enabled!;
		}
		if (Reflect.has(options, 'stars') && this.enabled) {
			this.stars = options.stars!;
			await this.#updateStarMessage();
		}
		if (options.starMessageID === null) {
			this.starMessageID = null;
			this.#starMessage = null;
		}

		await this.save();
		return this;
	}

	/**
	 * Destroy this instance
	 */
	public async destroy() {
		await this.remove();
		this.#manager.delete(this.#message.id);
	}

	/**
	 * Checks for the existence of the star message
	 */
	public async downloadStarMessage(): Promise<void> {
		if (!this.starMessageID) return;

		const channelID = await this.#message.guild.readSettings(GuildSettings.Starboard.Channel);
		if (isNullish(channelID)) return;

		const channel = this.#message.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (isNullish(channel)) {
			await this.#message.guild.writeSettings([[GuildSettings.Starboard.Channel, null]]);
			return;
		}

		try {
			this.#starMessage = (await channel.messages.fetch(this.starMessageID)) as GuildMessage;
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === RESTJSONErrorCodes.UnknownMessage) await this.destroy();
			}
		}
	}

	/**
	 * Synchronize the data with Discord
	 */
	public async downloadUserList(): Promise<void> {
		try {
			this.#users = await fetchReactionUsers(
				this.#client,
				this.#message.channel.id,
				this.#message.id,
				await this.#message.guild.readSettings(GuildSettings.Starboard.Emoji)
			);

			// TODO: https://github.com/skyra-project/skyra/issues/569
			this.#users.delete(this.#message.author.id);
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === RESTJSONErrorCodes.MissingAccess) return;
				if (error.code === RESTJSONErrorCodes.UnknownMessage) await this.destroy();
				return;
			}
		}

		if (!this.#users.size) {
			await this.destroy();
			return;
		}

		this.stars = this.#users.size;
	}

	/**
	 * The embed for the message
	 */
	private getEmbed(language: Language) {
		if (this.#starMessage?.embeds.length) {
			return this.#starMessage.embeds[0].setColor(this.color);
		}

		const message = this.#message;
		return new MessageEmbed()
			.setAuthor(message.author.username, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setColor(this.color)
			.setDescription(this.getContent(language))
			.setTimestamp(message.createdAt)
			.setImage(getImage(message)!);
	}

	/**
	 * The text
	 */
	private getContent(language: Language) {
		const url = `[${language.get(LanguageKeys.Misc.JumpTo)}](${this.#message.url})`;
		return `${url}\n${cutText(this.#message.content, 1800)}`;
	}

	/**
	 * Edits the message or sends a new one if it does not exist, includes full error handling
	 */
	private async updateStarMessage(): Promise<void> {
		const [minimum, channelID, language] = await this.#message.guild.readSettings((settings) => [
			settings[GuildSettings.Starboard.Minimum],
			settings[GuildSettings.Starboard.Channel],
			settings.getLanguage()
		]);

		if (this.stars < minimum || isNullish(channelID)) return;

		const content = `${this.emoji} **${this.stars}** ${this.#message.channel as TextChannel}`;
		if (this.#starMessage) {
			try {
				await this.#starMessage.edit(content, this.getEmbed(language));
			} catch (error) {
				if (!(error instanceof DiscordAPIError) || !(error instanceof HTTPError)) return;

				if (error.code === RESTJSONErrorCodes.MissingAccess) return;
				if (error.code === RESTJSONErrorCodes.UnknownMessage) await this.edit({ starMessageID: null, enabled: false });
			}

			return;
		}

		const channel = this.#message.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (!channel) return;

		const promise = channel
			.send(content, this.getEmbed(language))
			.then((message) => {
				this.#starMessage = message as GuildMessage;
				this.starMessageID = message.id;
			})
			.catch((error) => {
				if (!(error instanceof DiscordAPIError) || !(error instanceof HTTPError)) return;

				if (error.code === RESTJSONErrorCodes.MissingAccess) return;
				// Emit to console
				this.#client.emit(Events.Wtf, error);
			})
			.finally(() => this.#manager.syncMessageMap.delete(this));

		this.#manager.syncMessageMap.set(this, promise);
		await promise;
	}
}
