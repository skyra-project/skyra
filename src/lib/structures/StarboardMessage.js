const { MessageEmbed } = require('discord.js');
const { getImage } = require('../util/util');

const TABLENAME = 'starboard', TABLEINDEX = { index: 'channel_message' };

// Colors
const COLORS = [
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

class StarboardMessage {

	/**
	 * Construct a new StarboardMessage
	 * @since 3.0.0
	 * @param {StarboardManager} manager The StarboardManager instance that manages this instance
	 * @param {KlasaMessage} message The starred Message instance
	 */
	constructor(manager, message) {
		/**
		 * The StarboardManager instance that manages this instance
		 * @since 3.0.0
		 * @type {StarboardManager}
		 */
		this.manager = manager;

		/**
		 * The starred Message instance
		 * @since 3.0.0
		 * @type {TextChannel}
		 */
		this.channel = message.channel;

		/**
		 * The starred Message instance
		 * @since 3.0.0
		 * @type {KlasaMessage}
		 */
		this.message = message;

		/**
		 * Whether this StarboardMessage should operate or not
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.disabled = false;

		/**
		 * The users mapped by id that have starred this message
		 * @since 3.0.0
		 * @type {Set<string>}
		 */
		this.users = new Set();

		/**
		 * The Message instance that is sent in the Starboard channel
		 * @since 3.0.0
		 * @type {?KlasaMessage}
		 * @private
		 */
		this.starMessage = null;

		/**
		 * The UUID used to update this entry to the DB
		 * @since 3.0.0
		 * @type {string}
		 * @private
		 */
		this.UUID = null;

		/**
		 * The sync status for this StarboardMessage instance
		 * @since 3.0.0
		 * @type {?Promise<void>}
		 * @private
		 */
		this._syncStatus = null;

		/**
		 * The last time it got updated
		 * @since 3.0.0
		 * @type {number}
		 * @private
		 */
		this._lastUpdated = Date.now();
	}

	/**
	 * The Client that manages this instance
	 * @since 3.0.0
	 * @type {KlasaClient}
	 */
	get client() {
		return this.manager.client;
	}

	/**
	 * The provider that manages this starboard
	 * @since 3.0.0
	 * @type {Provider}
	 */
	get provider() {
		return this.manager.provider;
	}

	/**
	 * The emoji to use
	 * @since 3.0.0
	 * @type {string}
	 */
	get emoji() {
		const { stars } = this;
		if (stars < 5) return '⭐';
		if (stars < 10) return '🌟';
		if (stars < 25) return '💫';
		return '✨';
	}

	/**
	 * The color for the embed
	 * @since 3.0.0
	 * @type {number}
	 */
	get color() {
		const { stars } = this;
		if (stars <= MAXCOLORS) return COLORS[stars];
		return LASTCOLOR;
	}

	/**
	 * The embed for the message
	 * @since 3.0.0
	 * @type {MessageEmbed}
	 */
	get embed() {
		if (this.starMessage && this.starMessage.embeds) {
			return this.starMessage.embeds[0]
				.setColor(this.color);
		}
		if (!this.message) return null;
		return new MessageEmbed()
			.setAuthor(this.message.author.username, this.message.author.displayAvatarURL())
			.setColor(this.color)
			.setDescription(this.message.content)
			.setTimestamp(this.message.createdAt)
			.setImage(getImage(this.message));
	}

	/**
	 * The amount of stars this StarboardMessage has
	 * @since 3.0.0
	 * @type {number}
	 * @private
	 */
	get stars() {
		return this.users.size;
	}

	/**
	 * Sync this StarboardMessage instance with the database
	 * @since 3.0.0
	 * @returns {Promise<void>}
	 */
	sync() {
		if (!this._syncStatus) this._syncStatus = this._sync();
		return this._syncStatus;
	}

	/**
	 * Disable this StarboardMessage, pausing the star retrieval
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async disable() {
		if (this.disabled) return false;
		await this.provider.db.table(TABLENAME).get(this.UUID).update({ disabled: true });
		this.disabled = true;
		return true;
	}

	/**
	 * Disable this StarboardMessage, resuming the star retrieval
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async enable() {
		if (!this.disabled) return false;
		await this.provider.db.table(TABLENAME).get(this.UUID).update({ disabled: false });
		this.disabled = false;

		// Send the stars if it updated
		const prevStars = this.stars;
		if (prevStars !== await this.fetchStars()) await this.setStars();

		// Return true
		return true;
	}

	/**
	 * Add a new user to the list
	 * @since 3.0.0
	 * @param {string} userID The user's ID to add
	 * @returns {Promise<boolean>}
	 */
	add(userID) {
		if (this.message.author.id === userID || this.users.has(userID)) return Promise.resolve(false);
		this.users.add(userID);
		return this.setStars();
	}

	/**
	 * Remove a user to the list
	 * @since 3.0.0
	 * @param {string} userID The user's ID to remove
	 * @returns {Promise<boolean>}
	 */
	remove(userID) {
		if (this.message.author.id !== userID) {
			this.users.delete(userID);
			return this.setStars();
		}
		return Promise.resolve(false);
	}

	/**
	 * Fetch all users that reacted with ⭐ and cache them to the list
	 * @since 3.0.0
	 * @returns {Promise<number>}
	 */
	async fetchStars() {
		const users = await this._fetchUsers();
		if (!users.length) {
			this.destroy();
			return 0;
		}

		this.users.clear();
		for (const user of users) this.users.add(user.id);
		this.users.delete(this.message.author.id);
		return this.users.size;
	}

	/**
	 * Update the Message sent to the starboard channel
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async updateMessage() {
		// Don't update if it's not fully sync
		if (this._syncStatus) await this._syncStatus;

		const { stars } = this;
		if (this.disabled || this.manager.minimum > stars) return false;
		const content = `${this.emoji} **${stars}** ${this.channel} ID: ${this.message.id}`;
		if (this.starMessage) {
			try {
				await this.starMessage.edit(content, { embed: this.embed });
			} catch (error) {
				this.client.emit('warn', '[StarboardMessage] At updateMessage');
				this.client.emit('apiError', error);
				if (error.code === '10008') this.destroy();
			}
		} else {
			this.starMessage = await this.manager.starboardChannel.send(content, { embed: this.embed });
			await this._updateDatabase({ starMessageID: this.starMessage.id });
		}
		this._lastUpdated = Date.now();

		return true;
	}

	/**
	 * Set the amount of stars for this instance
	 * @since 3.0.0
	 * @param {number} stars The new amount of stars
	 * @returns {Promise<boolean>}
	 */
	async setStars() {
		if (this.disabled) return false;
		this._lastUpdated = Date.now();

		await this._updateDatabase({ stars: this.stars });
		await this.updateMessage();

		return true;
	}

	/**
	 * Destroy this instance
	 * @since 3.0.0
	 */
	destroy() {
		this.manager.delete(`${this.channel.id}-${this.message.id}`);
		this.dispose();
	}

	/**
	 * Dispose this instance to free space
	 * @since 3.0.0
	 */
	dispose() {
		this.manager = null;
		this.channel = null;
		this.message = null;
		this.disabled = true;
		this.starMessage = null;
		this.UUID = null;
		this.users.clear();
	}

	toJSON() {
		return {
			channelID: this.channel.id,
			disabled: this.disabled,
			messageID: this.message.id,
			starMessageID: (this.starMessage && this.starMessage.id) || null,
			stars: this.stars
		};
	}

	toString() {
		return `StarboardMessage(${this.channel.id}-${this.message.id}, ${this.stars})`;
	}

	async _updateDatabase(object) {
		if (this._syncStatus) await this._syncStatus;
		if (!this.UUID)
			[this.UUID] = (await this.provider.db.table(TABLENAME).insert({ ...this.toJSON(), ...object })).generated_keys;
		else
			await this.provider.db.table(TABLENAME).get(this.UUID).update(object);
	}

	/**
	 * Sync the StarboardMessage instance with the database
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 * @private
	 */
	async _sync() {
		await this.fetchStars();

		if (this.stars) {
			const data = await this.provider.db
				.table(TABLENAME)
				.getAll([this.channel.id, this.message.id], TABLEINDEX)
				.limit(1)
				.nth(0)
				.default(null);

			if (data) {
				this.UUID = data.id;
				this.disabled = Boolean(data.disabled);

				const channel = this.manager.starboardChannel;
				if (data.starMessageID) this.starMessage = await channel.messages.fetch(data.starMessageID).catch(() => null);
				if (!this.disabled && !this.starMessage && this.stars >= this.manager.minimum) {
					const content = `${this.emoji} **${this.stars}** ${this.channel} ID: ${this.message.id}`;
					this.starMessage = await channel.send(content, this.embed);
					this.provider.db.table(TABLENAME).get(this.UUID).update({ starMessageID: this.starMessage.id });
				}
			}
		}

		this._syncStatus = null;
		return this;
	}

	/**
	 * Fetch the users
	 * @since 3.0.0
	 * @returns {Promise<Object<string, *>[]>}
	 * @private
	 */
	_fetchUsers() {
		return this.client.api.channels[this.channel.id].messages[this.message.id]
			.reactions['%E2%AD%90']
			.get({ query: { limit: 100 } })
			.catch(() => []);
	}

}

StarboardMessage.COLORS = COLORS;

module.exports = StarboardMessage;
