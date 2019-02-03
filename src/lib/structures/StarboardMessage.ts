import { Client, DiscordAPIError, Message, MessageEmbed, TextChannel } from 'discord.js';
import RethinkDB from '../../providers/rethinkdb';
import { getImage } from '../util/util';
import { StarboardManager } from './StarboardManager';

const TABLENAME = 'starboard', TABLEINDEX = { index: 'channel_message' };

export class StarboardMessage {

	public get id() {
		return `${this.channel.guild.id}.${this.message.id}`;
	}

	/**
	 * The amount of stars this StarboardMessage has
	 */
	public get stars(): number {
		return this.users.size;
	}

	/**
	 * The Client that manages this instance
	 */
	private get client(): Client {
		return this.manager.client;
	}

	/**
	 * The provider that manages this starboard
	 */
	private get provider(): RethinkDB {
		return this.manager.provider;
	}

	/**
	 * The emoji to use
	 */
	private get emoji() {
		const stars = this.stars;
		if (stars < 5) return '⭐';
		if (stars < 10) return '🌟';
		if (stars < 25) return '💫';
		return '✨';
	}

	/**
	 * The color for the embed
	 */
	private get color(): number {
		const stars = this.stars;
		if (stars <= MAXCOLORS) return COLORS[stars];
		return LASTCOLOR;
	}

	/**
	 * The embed for the message
	 */
	private get embed(): MessageEmbed {
		if (this.starMessage && this.starMessage.embeds) {
			return this.starMessage.embeds[0]
				.setColor(this.color);
		}
		if (!this.message) return null;
		return new MessageEmbed()
			.setURL(this.message.url)
			.setTitle(this.message.language.get('STARBOARD_JUMPTO'))
			.setAuthor(this.message.author.username, this.message.author.displayAvatarURL())
			.setColor(this.color)
			.setDescription(this.message.content)
			.setTimestamp(this.message.createdAt)
			.setImage(getImage(this.message));
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
	private starMessage: Message = null;

	/**
	 * Whether this entry exists in the DB or not, null if it's not synchronized.
	 */
	private readonly existenceStatus: boolean | null = null;

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
		const sync = Promise.all([this._syncDatabase(), this._syncDiscord()]).then(() => {
			this.manager.syncMap.delete(this);
			return this;
		});

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
		if (this.message.author.id !== id && !this.users.has(id)) {
			this.users.add(id);
			await this.edit({ stars: this.stars });
		}
	}

	/**
	 * Remove a user to the list
	 * @param id The user's ID to remove
	 */
	public async remove(id: string): Promise<void> {
		if (this.message.author.id !== id && this.users.has(id)) {
			this.users.delete(id);
			await this.edit({ stars: this.stars });
		}
	}

	/**
	 * Save data to the database
	 * @param options The options
	 */
	public async edit(options: StarboardMessageEdit): Promise<this> {
		this.lastUpdated = Date.now();
		if (this.existenceStatus === null) await this.sync();

		if ('disabled' in options) this.disabled = options.disabled;
		if ('starMessageID' in options && options.starMessageID === null) this.starMessage = null;
		if ('stars' in options && !this.disabled) await this._editMessage();

		if (!this.existenceStatus)
			await this.provider.db.table(TABLENAME).insert({ ...this.toJSON(), ...options }).run();
		else
			await this.provider.db.table(TABLENAME).get(this.id).update(options).run();

		return this;
	}

	/**
	 * Destroy this instance
	 */
	public async destroy(): Promise<void> {
		if (this.existenceStatus === null) await this.sync();
		if (this.existenceStatus) await this.provider.db.table(TABLENAME).get(this.id).delete().run();
		this.manager.delete(this.message.id);
	}

	public toJSON(): StarboardMessageData {
		return {
			channelID: this.channel.id,
			disabled: this.disabled,
			guildID: this.channel.guild.id,
			id: `${this.channel.guild.id}.${this.message.id}`,
			messageID: this.message.id,
			starMessageID: (this.starMessage && this.starMessage.id) || null,
			stars: this.stars,
			userID: this.message.author.id
		};
	}

	public toString() {
		return `StarboardMessage(${this.message.id}, ${this.stars})`;
	}

	/**
	 * Synchronize the data with Discord
	 */
	private async _syncDiscord(): Promise<void> {
		let users;
		try {
			// @ts-ignore
			users = await this.client.api.channels[this.channel.id].messages[this.message.id]
				.reactions[this.channel.guild.settings.get('starboard.emoji')]
				.get({ query: { limit: 100 } });
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				// Missing Access
				if (error.code === 50001) return;
				// Unknown Message
				if (error.code === 10008) await this.destroy();
				return;
			}
		}

		if (!users.length) {
			await this.destroy();
			return;
		}

		this.users.clear();
		for (const user of users) this.users.add(user.id);
		this.users.delete(this.message.author.id);
	}

	/**
	 * Synchronizes the data with the database
	 */
	private async _syncDatabase(): Promise<void> {
		const data: StarboardMessageData = await this.provider.db
			.table(TABLENAME)
			.getAll([this.channel.id, this.message.id], TABLEINDEX)
			.limit(1)
			.nth(0)
			.default(null)
			.run();

		if (data) {
			this.disabled = Boolean(data.disabled);

			const channel = this.manager.starboardChannel;
			if (data.starMessageID) {
				await channel.messages.fetch(data.starMessageID)
					.then((message) => { this.starMessage = message; })
					.catch(() => undefined);
			}
			if (!this.disabled && !this.starMessage && this.stars >= this.manager.minimum)
				await this._editMessage();
		} else {
			this.disabled = false;
		}
	}

	/**
	 * Edits the message or sends a new one if it does not exist, includes full error handling
	 */
	private async _editMessage(): Promise<void> {
		if (this.stars < this.manager.minimum) return;
		const content = `${this.emoji} **${this.stars}** ${this.channel} ID: ${this.message.id}`;
		if (this.starMessage) {
			try {
				await this.starMessage.edit(content, this.embed);
			} catch (error) {
				if (!(error instanceof DiscordAPIError)) return;

				// Missing Access
				if (error.code === 50001) return;
				// Unknown Message
				if (error.code === 10008) await this.edit({ starMessageID: null, disabled: true });
			}
		} else {
			try {
				const message = await this.manager.starboardChannel.send(content, this.embed);
				// @ts-ignore
				this.starMessage = message;
			} catch (error) {
				if (!(error instanceof DiscordAPIError)) return;

				// Missing Access
				if (error.code === 50001) return;
				// Emit to console
				this.client.emit('wtf', error);
			}
		}
	}

}

// Colors
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

interface StarboardMessageEdit {
	/**
	 * The star message id
	 */
	starMessageID?: string;
	/**
	 * The amount of stars
	 */
	stars?: number;
	/**
	 * Whether it's disabled or not
	 */
	disabled?: boolean;
}

interface StarboardMessageData {
	id: string;
	channelID: string;
	disabled: boolean;
	guildID: string;
	messageID: string;
	starMessageID: string | null;
	stars: number;
	userID: string;
}
