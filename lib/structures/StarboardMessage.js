const { MessageEmbed } = require('discord.js');
const { getImage } = require('../util/util');

const TABLENAME = 'starboard', TABLEINDEX = { index: 'channel_message' };

// Colors
const MAXCOLORS = 15, STEP = 80 / MAXCOLORS;
const COLORS = [];
for (let i = 0; i < MAXCOLORS; i++) COLORS.push((0xFFE3AF + (i * STEP)) | 0);
const LASTCOLOR = COLORS[MAXCOLORS - 1];

module.exports = class StarboardMessage {

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
	 * The amount of stars this StarboardMessage has
	 * @since 3.0.0
	 * @type {number}
	 * @private
	 */
	get stars() {
		return this.users.size;
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
		const stars = this.stars;
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
		const stars = this.stars;
		if (stars < MAXCOLORS) return COLORS[stars];
		return LASTCOLOR;
	}

	/**
	 * The embed for the message
	 * @since 3.0.0
	 * @type {MessageEmbed}
	 */
	get embed() {
		if (this.starMessage && this.starMessage.embeds) return this.starMessage.embeds[0]
			.setColor(this.color);
		if (!this.message) return null;
		return new MessageEmbed()
			.setAuthor(this.message.author.username, this.message.author.displayAvatarURL())
			.setColor(this.color)
			.setDescription(this.message.content)
			.setTimestamp(this.message.createdAt)
			.setImage(getImage(this.message));
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
		await this.fetchStars();
		if (prevStars !== this.stars) await this.setStars();

		// Return true
		return true;
	}

	/**
	 * Add a new user to the list
	 * @since 3.0.0
	 * @param {string} userID The user's ID to add
	 * @returns {Promise<boolean>}
	 */
	async add(userID) {
		if (this.message.author.id !== userID && !this.users.has(userID) && this.users.add(userID)) return this.setStars();
		return false;
	}

	/**
	 * Remove a user to the list
	 * @since 3.0.0
	 * @param {string} userID The user's ID to remove
	 * @returns {Promise<boolean>}
	 */
	async remove(userID) {
		if (this.message.author.id !== userID && this.users.delete(userID)) return this.setStars();
		return false;
	}

	/**
	 * Fetch all users that reacted with ⭐ and cache them to the list
	 * @since 3.0.0
	 * @returns {Promise<number>}
	 */
	async fetchStars() {
		const reaction = this.message.reactions.get('⭐');
		if (!reaction) {
			this.destroy();
			return 0;
		}

		const users = await reaction.users.fetch();
		this.users.clear();
		for (const userID of users.keys()) this.users.add(userID);
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

		const stars = this.stars;
		if (this.disabled || stars < this.manager.minimum) return false;
		const content = `${this.emoji} **${stars}** ${this.channel} ID: ${this.message.id}`;
		if (this.starMessage) {
			try {
				await this.starMessage.edit(content, { embed: this.embed });
			} catch (error) {
				if (typeof this.starMessage.edit !== 'function') {
					this.client.emit('warn', 'StarboardMessage#message.edit is not a function');
					this.client.emit('wtf', this.starMessage);
				} else {
					this.client.emit('error', error);
					this.destroy();
				}
			}
		} else {
			this.starMessage = await this.manager.starboardChannel.send(content, { embed: this.embed });
			this.provider.db.table(TABLENAME).get(this.UUID).update({ starMessageID: this.starMessage.id });
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
		const r = this.provider.db;

		if (!this.UUID) {
			const result = await r.table(TABLENAME).insert(this.toJSON());
			this.UUID = result.generated_keys[0];
		} else {
			await r.table(TABLENAME).get(this.UUID).update({ stars: this.stars });
		}
		await this.updateMessage();

		return true;
	}

	/**
	 * Destroy this instance
	 * @since 3.0.0
	 */
	destroy() {
		this.manager.delete(`${this.channel.id}-${this.channel.id}`);
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

	/**
	 * Sync the StarboardMessage instance with the database
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 * @private
	 */
	async _sync() {
		const fetchStars = this.fetchStars();
		const [data] = await this.provider.db.table(TABLENAME).getAll([this.channel.id, this.message.id], TABLEINDEX)
			.limit(1).catch(() => []);

		if (data) {
			this.UUID = data.id;
			this.disabled = Boolean(data.disabled);

			const channel = this.manager.starboardChannel;
			const message = await channel.messages.fetch(data.starMessageID).catch(() => null);
			if (message) this.starMessage = message;
			else if (this.stars < this.manager.minimum) await channel.send(this.embed);
		}

		// Ensure the stars are fetched
		await fetchStars;

		this._syncStatus = null;
		return this;
	}

};
