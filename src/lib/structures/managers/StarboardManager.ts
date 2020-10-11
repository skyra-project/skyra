import Collection from '@discordjs/collection';
import { StarboardEntity } from '@lib/database/entities/StarboardEntity';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { Client, Guild, TextChannel } from 'discord.js';
import { DbSet } from '../DbSet';

/**
 * The StarboardManager class that manages the starboard channel
 * @version 4.0.0
 */
export class StarboardManager extends Collection<string, StarboardEntity> {
	/**
	 * The Client instance that manages this manager
	 */
	public client: Client;

	/**
	 * The Guild instance that manages this manager
	 */
	public guild: Guild;

	public syncMap = new Map<string, Promise<StarboardEntity>>();
	public syncMessageMap = new WeakMap<StarboardEntity, Promise<void>>();

	public constructor(guild: Guild) {
		super();
		this.client = guild.client;
		this.guild = guild;
	}

	/**
	 * [LRU-System] Set an entry to the cache. Automatically removes the Least Recently Used.
	 * @param key The key to add
	 * @param value The StarEntity to add
	 */
	public set(key: string, value: StarboardEntity) {
		if (this.size >= 25) {
			const entry =
				this.find((sMes) => sMes.stars < this.minimum) ||
				this.reduce((acc, sMes) => (acc.lastUpdated > sMes.lastUpdated ? sMes : acc), this.first()!);
			this.delete(entry.messageID);
		}
		return super.set(key, value);
	}

	/**
	 * Get the Starboard channel
	 */
	public get starboardChannel() {
		const channelID = this.guild.settings.get(GuildSettings.Starboard.Channel);
		return (channelID && (this.guild.channels.cache.get(channelID) as TextChannel)) || null;
	}

	/**
	 * Get the minimum amount of stars
	 */
	public get minimum() {
		return this.guild.settings.get(GuildSettings.Starboard.Minimum);
	}

	/**
	 * Fetch a StarboardMessage entry
	 * @param channel The text channel the message was sent
	 * @param messageID The message id
	 * @param userID The user id
	 */
	public async fetch(channel: TextChannel, messageID: string) {
		const entry = super.get(messageID);
		if (entry) return entry;

		const message = await channel.messages.fetch(messageID).catch(() => null);
		if (message) {
			const { starboards } = await DbSet.connect();
			const previous = await starboards.findOne({ where: { guildID: this.guild.id, messageID } });
			if (previous) {
				previous.setup(this, message);
				await previous.downloadStarMessage();
				if (!previous.hasId()) return null;
			}

			const star = previous ?? new StarboardEntity().setup(this, message);
			this.set(messageID, star);

			await star.downloadUserList();
			return star;
		}

		return null;
	}
}
