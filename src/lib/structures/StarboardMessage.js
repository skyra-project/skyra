/// <reference path="../../index.d.ts" />
const { MessageEmbed, DiscordAPIError } = require('discord.js');
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

	constructor(manager, message) {
		/**
		 * The StarboardManager instance that manages this instance
		 * @since 3.0.0
		 * @type {SKYRA.StarboardManager}
		 */
		this.manager = manager;

		/**
		 * The starred Message instance
		 * @since 3.0.0
		 * @type {SKYRA.SkyraTextChannel}
		 */
		// @ts-ignore
		this.channel = message.channel;

		/**
		 * The starred Message instance
		 * @since 3.0.0
		 * @type {SKYRA.SkyraMessage}
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
		 * @type {?SKYRA.SkyraMessage}
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
		 * @type {?Promise<this>}
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
	 * @type {SKYRA.Skyra}
	 */
	get client() {
		return this.manager.client;
	}

	/**
	 * The provider that manages this starboard
	 * @since 3.0.0
	 * @type {SKYRA.RebirthDB}
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
			.setURL(this.message.url)
			.setTitle(this.message.language.get('STARBOARD_JUMPTO'))
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
	 * @returns {Promise<this>}
	 */
	sync() {
		if (!this._syncStatus) {
			this._syncStatus = Promise.all([
				this._syncDatabase(),
				this._syncDiscord()
			]).then(() => {
				this._syncStatus = null;
				return this;
			});
		}
		return this._syncStatus;
	}

	/**
	 * Disable this StarboardMessage, pausing the star retrieval
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async disable() {
		if (this.disabled) return false;
		await this.edit({ disabled: true });
		return true;
	}

	/**
	 * Disable this StarboardMessage, resuming the star retrieval
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async enable() {
		if (!this.disabled) return false;
		await this.edit({ disabled: false });
		await this.sync();
		return true;
	}

	/**
	 * Add a new user to the list
	 * @since 3.0.0
	 * @param {string} userID The user's ID to add
	 */
	async add(userID) {
		if (this.message.author.id !== userID && !this.users.has(userID)) {
			this.users.add(userID);
			await this.edit({ stars: this.stars });
		}
	}

	/**
	 * Remove a user to the list
	 * @since 3.0.0
	 * @param {string} userID The user's ID to remove
	 */
	async remove(userID) {
		if (this.message.author.id !== userID && this.users.has(userID)) {
			this.users.delete(userID);
			await this.edit({ stars: this.stars });
		}
	}

	/**
	 * Save data to the database
	 * @param {Object} options The options
	 * @param {string} [options.starMessageID] The star message id
	 * @param {number} [options.stars] The stars
	 * @param {boolean} [options.disabled] Whether or not the message is disabled
	 * @returns {Promise<this>}
	 */
	async edit(options) {
		this._lastUpdated = Date.now();

		if ('disabled' in options) this.disabled = options.disabled;
		if ('starMessageID' in options && options.starMessageID === null) this.starMessage = null;
		if ('stars' in options && !this.disabled) await this._editMessage();

		if (this._syncStatus) await this._syncStatus;
		if (!this.UUID)
			[this.UUID] = (await this.provider.db.table(TABLENAME).insert({ ...this.toJSON(), ...options }).run()).generated_keys;
		else
			await this.provider.db.table(TABLENAME).get(this.UUID).update(options).run();

		return this;
	}

	/**
	 * Destroy this instance
	 * @since 3.0.0
	 */
	async destroy() {
		if (this.UUID) await this.provider.db.table(TABLENAME).get(this.UUID).delete().run();
		this.manager.delete(`${this.channel.id}-${this.message.id}`);
	}

	toJSON() {
		return {
			userID: this.message.author.id,
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
	 * Edits the message or sends a new one if it does not exist, includes full error handling
	 * @private
	 */
	async _editMessage() {
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

	/**
	 * Synchronize the data with Discord
	 * @private
	 */
	async _syncDiscord() {
		let users;
		try {
			// @ts-ignore
			users = await this.client.api.channels[this.channel.id].messages[this.message.id]
				.reactions[this.channel.guild.settings.starboard.emoji]
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
	 * @private
	 */
	async _syncDatabase() {
		const data = await this.provider.db
			.table(TABLENAME)
			.getAll([this.channel.id, this.message.id], TABLEINDEX)
			.limit(1)
			.nth(0)
			.default(null)
			.run();

		if (data) {
			this.UUID = data.id;
			this.disabled = Boolean(data.disabled);

			const channel = this.manager.starboardChannel;
			if (data.starMessageID) {
				await channel.messages.fetch(data.starMessageID)
					// @ts-ignore
					.then((message) => { this.starMessage = message; })
					.catch(() => undefined);
			}
			if (!this.disabled && !this.starMessage && this.stars >= this.manager.minimum)
				await this._editMessage();
		} else {
			this.UUID = null;
			this.disabled = false;
		}
	}

}

StarboardMessage.COLORS = COLORS;

module.exports = StarboardMessage;
