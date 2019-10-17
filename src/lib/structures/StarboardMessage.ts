import { DiscordAPIError, HTTPError, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Databases } from '../types/constants/Constants';
import { Events } from '../types/Enums';
import { GuildSettings } from '../types/settings/GuildSettings';
import { cutText, fetchReactionUsers, getImage } from '../util/util';
import { StarboardManager } from './StarboardManager';

export const COLORS = [
	0xFFE3AF,
	0xFFE0A5,
	0xFFDD9C,
	0xFFDB92,
	0xFFD889,
	0xFFD57F,
	0xFFD275,
	0xFFCF6B,
	0xFFCC61,
	0xFFCA57,
	0xFFC74C,
	0xFFC440,
	0xFFC133,
	0xFFBE23,
	0xFFBB09
];
const MAXCOLORS = COLORS.length - 1;
const LASTCOLOR = COLORS[MAXCOLORS];

export class StarboardMessage {

	public get id() {
		return `${this.channel.guild!.id}.${this.message.id}`;
	}

	/**
	 * The amount of stars this StarboardMessage has
	 */
	public get stars() {
		return this.users.size;
	}

	/**
	 * The Client that manages this instance
	 */
	private get client() {
		return this.manager.client;
	}

	/**
	 * The provider that manages this starboard
	 */
	private get provider() {
		return this.manager.provider;
	}

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
		const { stars } = this;
		if (stars <= MAXCOLORS) return COLORS[stars];
		return LASTCOLOR;
	}

	/**
	 * The formatted masked url
	 */
	private get maskedUrl() {
		return `[${this.message.language.tget('JUMPTO')}](${this.message.url})`;
	}

	/**
	 * The text
	 */
	private get content() {
		return `${this.maskedUrl}\n${cutText(this.message.content, 1800)}`;
	}

	/**
	 * The embed for the message
	 */
	private get embed() {
		if (this.starMessage && this.starMessage.embeds) {
			return this.starMessage.embeds[0]
				.setColor(this.color);
		}
		if (!this.message) return null;
		return new MessageEmbed()
			.setAuthor(this.message.author!.username, this.message.author!.displayAvatarURL())
			.setColor(this.color)
			.setDescription(this.content)
			.setTimestamp(this.message.createdAt)
			.setImage(getImage(this.message)!);
	}

	/**
	 * The StarboardManager instance that manages this instance
	 */
	public manager: StarboardManager;

	/**
	 * The channel this message was starred at
	 */
	public channel: TextChannel;

	/**
	 * The starred Message instance
	 */
	public message: Message;

	/**
	 * Whether this StarboardMessage should operate or not
	 */
	public disabled = false;

	/**
	 * The users mapped by id that have starred this message
	 */
	public users: Set<string> = new Set();

	/**
	 * The last time it got updated
	 */
	public lastUpdated = Date.now();

	/**
	 * The Message instance that is sent in the Starboard channel
	 */
	private starMessage: Message | null = null;

	/**
	 * Whether this entry exists in the DB or not, null if it's not synchronized.
	 */
	private existenceStatus: boolean | null = null;

	public constructor(manager: StarboardManager, message: Message) {
		this.manager = manager;
		this.channel = message.channel as TextChannel;
		this.message = message;
	}

	/**
	 * Sync this StarboardMessage instance with the database
	 */
	public sync(force: boolean = this.existenceStatus === null): Promise<StarboardMessage> {
		// Await current sync status from the sync queue
		const syncStatus = this.manager.syncMap.get(this);
		if (!force || syncStatus) return syncStatus || Promise.resolve(this);

		// If it's not currently synchronizing, create a new sync status for the sync queue
		const sync = Promise.all([this._syncDatabase(), this._syncDiscord()])
			.then(() => this)
			.finally(() => this.manager.syncMap.delete(this));

		this.manager.syncMap.set(this, sync);
		return sync;
	}

	/**
	 * Disable this StarboardMessage, pausing the star retrieval
	 */
	public async disable(): Promise<boolean> {
		if (this.disabled) return false;
		await this.edit({ disabled: true });
		return true;
	}

	/**
	 * Enables this StarboardMessage, resuming the star retrieval
	 */
	public async enable(): Promise<boolean> {
		if (!this.disabled) return false;
		await this.edit({ disabled: false });
		await this.sync();
		return true;
	}

	/**
	 * Add a new user to the list
	 * @param id The user's ID to add
	 */
	public async add(id: string): Promise<void> {
		if (this.message.author!.id !== id && !this.users.has(id)) {
			this.users.add(id);
			await this.edit({ stars: this.stars });
		}
	}

	/**
	 * Remove a user to the list
	 * @param id The user's ID to remove
	 */
	public async remove(id: string): Promise<void> {
		if (this.message.author!.id !== id && this.users.has(id)) {
			this.users.delete(id);
			await this.edit({ stars: this.stars });
		}
	}

	public get table() {
		return this.provider.db.table<StarboardMessageData>(Databases.Starboard);
	}

	/**
	 * Save data to the database
	 * @param options The options
	 */
	public async edit(options: StarboardMessageEdit): Promise<this> {
		this.lastUpdated = Date.now();
		if (this.existenceStatus === null) await this.sync();

		// If a message was in progress to be sent, await it first
		const previousUpdate = this.manager.syncMessageMap.get(this);
		if (previousUpdate) await previousUpdate;

		if ('disabled' in options) this.disabled = options.disabled!;
		if ('starMessageID' in options && options.starMessageID === null) this.starMessage = null;
		if ('stars' in options && !this.disabled) await this._editMessage();

		if (this.existenceStatus) {
			await this.table.get(this.id).update({ ...this.toJSON(), ...options })
				.run();
		} else {
			await this.table.insert({ ...this.toJSON(), ...options }).run();
			this.existenceStatus = true;
		}

		return this;
	}

	/**
	 * Destroy this instance
	 */
	public async destroy(): Promise<void> {
		if (this.existenceStatus === null) await this.sync();
		if (this.existenceStatus) {
			await this.table.get(this.id).delete().run();
		}
		this.manager.delete(this.message.id);
	}

	public toJSON(): StarboardMessageData {
		return {
			channelID: this.channel.id,
			disabled: this.disabled,
			guildID: this.channel.guild!.id,
			id: this.id,
			messageID: this.message.id,
			starMessageID: (this.starMessage && this.starMessage.id) || null,
			stars: this.stars,
			userID: this.message.author!.id
		};
	}

	public toString() {
		return `StarboardMessage(${this.message.id}, ${this.stars})`;
	}

	/**
	 * Synchronize the data with Discord
	 */
	private async _syncDiscord(): Promise<void> {
		try {
			this.users = await fetchReactionUsers(this.client, this.channel.id, this.message.id,
				this.channel.guild!.settings.get(GuildSettings.Starboard.Emoji));
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				// Missing Access
				if (error.code === 50001) return;
				// Unknown Message
				if (error.code === 10008) await this.destroy();
				return;
			}
		}

		if (!this.users.size) {
			await this.destroy();
			return;
		}

		this.users.delete(this.message.author!.id);
	}

	/**
	 * Synchronizes the data with the database
	 */
	private async _syncDatabase(): Promise<void> {
		const data = await this.provider.db
			.table<StarboardMessageData | null>(Databases.Starboard)
			.get(this.id)
			.default(null)
			.run();

		if (data) {
			this.disabled = Boolean(data.disabled);
			this.existenceStatus = true;

			const channel = this.manager.starboardChannel!;
			if (data.starMessageID) {
				await channel.messages.fetch(data.starMessageID)
					.then(message => { this.starMessage = message; })
					.catch(() => undefined);
			}
		} else {
			this.disabled = false;
			this.existenceStatus = false;
		}
	}

	/**
	 * Edits the message or sends a new one if it does not exist, includes full error handling
	 */
	private async _editMessage(): Promise<void> {
		if (this.stars < this.manager.minimum) return;
		const content = `${this.emoji} **${this.stars}** ${this.channel}`;
		if (this.starMessage) {
			try {
				await this.starMessage.edit(content, this.embed!);
			} catch (error) {
				if (!(error instanceof DiscordAPIError) || !(error instanceof HTTPError)) return;

				// Missing Access
				if (error.code === 50001) return;
				// Unknown Message
				if (error.code === 10008) await this.edit({ starMessageID: null, disabled: true });
			}
		} else {
			const promise = this.manager.starboardChannel!.send(content, this.embed!)
				.then(message => { this.starMessage = message; })
				.catch(error => {
					if (!(error instanceof DiscordAPIError) || !(error instanceof HTTPError)) return;

					// Missing Access
					if (error.code === 50001) return;
					// Emit to console
					this.client.emit(Events.Wtf, error);
				})
				.finally(() => this.manager.syncMessageMap.delete(this));
			this.manager.syncMessageMap.set(this, promise);
			await promise;
		}
	}

}

interface StarboardMessageEdit {
	/**
	 * The star message id
	 */
	starMessageID?: string | null;
	/**
	 * The amount of stars
	 */
	stars?: number;
	/**
	 * Whether it's disabled or not
	 */
	disabled?: boolean;
}

export interface StarboardMessageData {
	id: string;
	channelID: string;
	disabled: boolean;
	guildID: string;
	messageID: string;
	starMessageID: string | null;
	stars: number;
	userID: string;
}
