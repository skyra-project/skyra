import { StarboardEntity } from '#lib/database/entities';
import { GuildSettings } from '#lib/database/keys';
import { readSettings } from '#lib/database/settings';
import type { GuildMessage } from '#lib/types';
import Collection from '@discordjs/collection';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Guild, TextChannel } from 'discord.js';

/**
 * The StarboardManager class that manages the starboard channel
 * @version 4.0.0
 */
export class StarboardManager extends Collection<string, StarboardEntity> {
	/**
	 * The Guild instance that manages this manager
	 */
	public guild: Guild;

	/**
	 * The synchronization map for [[StarboardManager.fetch]] calls.
	 */
	public syncMap = new Map<string, Promise<StarboardEntity | null>>();

	/**
	 * The synchronization map for [[StarboardEntity.updateStarMessage]] calls.
	 */
	public syncMessageMap = new WeakMap<StarboardEntity, Promise<void>>();

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	/**
	 * [LRU-System] Set an entry to the cache. Automatically removes the Least Recently Used.
	 * @param key The key to add
	 * @param value The StarEntity to add
	 */
	public set(key: string, value: StarboardEntity) {
		if (this.size >= 25) {
			const entry = this.reduce((acc, sMes) => (acc.lastUpdated > sMes.lastUpdated ? sMes : acc), this.first()!);
			this.delete(entry.messageId);
		}
		return super.set(key, value);
	}

	/**
	 * Get the Starboard channel
	 */
	public async getStarboardChannel() {
		const channelId = await readSettings(this.guild, GuildSettings.Starboard.Channel);
		if (isNullish(channelId)) return null;
		return (this.guild.channels.cache.get(channelId) ?? null) as TextChannel | null;
	}

	/**
	 * Get the minimum amount of stars
	 */
	public getMinimumStars() {
		return readSettings(this.guild, GuildSettings.Starboard.Minimum);
	}

	/**
	 * Fetch a StarboardMessage entry
	 * @param channel The text channel the message was sent
	 * @param messageId The message id
	 */
	public async fetch(channel: GuildTextBasedChannelTypes, messageId: string): Promise<StarboardEntity | null> {
		// If a key already exists, return it:
		const entry = super.get(messageId);
		if (entry) return entry;

		// If a key is already synchronising, return the pending promise:
		const previousPending = this.syncMap.get(messageId);
		if (previousPending) return previousPending;

		// Start a new synchronization and return the promise:
		const newPending = this.fetchEntry(channel, messageId).finally(() => this.syncMap.delete(messageId));
		this.syncMap.set(messageId, newPending);
		return newPending;
	}

	private async fetchEntry(channel: GuildTextBasedChannelTypes, messageId: string): Promise<StarboardEntity | null> {
		const message = (await channel.messages.fetch(messageId).catch(() => null)) as GuildMessage | null;
		if (!message) return null;

		const { starboards } = container.db;
		const previous = await starboards.findOne({ where: { guildId: this.guild.id, messageId } });
		if (previous) {
			previous.init(this, message);
			await previous.downloadStarMessage();
			if (!previous.hasId()) return null;
		}

		const star = previous ?? new StarboardEntity().init(this, message);
		this.set(messageId, star);

		await star.downloadUserList();
		return star.enabled ? star : null;
	}
}
