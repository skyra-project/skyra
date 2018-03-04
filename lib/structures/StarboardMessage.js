const { MessageEmbed } = require('discord.js');

// Colors
const MAXCOLORS = 20, STEP = 80 / MAXCOLORS;
const COLORS = new Array(MAXCOLORS).map((__, i) => (0xFFE3AF + (i * STEP)) | 0);
const LASTCOLOR = COLORS[MAXCOLORS - 1];

// Schema
const TABLENAME = 'starboard', INDEXNAME = 'guild_message';

// Filter
const IMAGE_EXTENSION = /(\.bmp|\.jpg|\.jpeg|\.png|\.gif|\.webp)$/i;

class StarboardMessage {

	constructor(starboard) {
		/**
		 * The client that initialised this instance
		 * @since 3.0.0
		 * @type {Skyra}
		 */
		this.client = starboard.client;

		/**
		 * The Starboard that initialises and manages this instance
		 * @since 3.0.0
		 * @type {Starboard}
		 */
		this.starboard = starboard;

		/**
		 * The message from the starboard
		 * @since 3.0.0
		 * @type {?Message}
		 */
		this.starMessage = null;

		/**
		 * The starred message
		 * @since 3.0.0
		 * @type {?Message}
		 */
		this.message = null;

		/**
		 * The users that starred this message
		 * @since 3.0.0
		 * @type {?Set<string>}
		 */
		this.users = null;

		/**
		 * The UUID for this instance in the database
		 * @since 3.0.0
		 * @type {?string}
		 */
		this.UUID = null;

		/**
		 * Whether this instance initialised or not
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.inited = false;

		/**
		 * Whether this instance is disabled or not
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.disabled = false;
	}

	/**
	 * The amount of stars this message has
	 * @since 3.0.0
	 * @type {number}
	 */
	get amount() {
		return this.users ? this.users.size : 1;
	}

	/**
	 * The guild this StarboardMessage belongs to
	 * @since 3.0.0
	 * @type {KlasaGuild}
	 */
	get guild() {
		return this.starboard.guild;
	}

	/**
	 * The emoji to use
	 * @since 3.0.0
	 * @type {string}
	 */
	get emoji() {
		if (this.amount < 5) return '⭐';
		if (this.amount < 10) return '🌟';
		if (this.amount < 25) return '💫';
		return '✨';
	}

	/**
	 * The color for the embed
	 * @since 3.0.0
	 * @type {number}
	 */
	get color() {
		if (this.amount < MAXCOLORS) return COLORS[this.amount];
		return LASTCOLOR;
	}

	/**
	 * The embed for the message
	 * @since 3.0.0
	 * @type {MessageEmbed}
	 */
	get embed() {
		if (this.starMessage) return this.starMessage.embeds[0]
			.setColor(this.color);
		if (!this.message) return null;
		return new MessageEmbed()
			.setColor(this.color)
			.setDescription(this.message.content)
			.setTimestamp(this.message.createdAt)
			.setImage(StarboardMessage.filterAttachments(this.message.attachments)
				|| StarboardMessage.filterEmbeds(this.message.embeds));
	}

	/**
	 * Update the message
	 * @since 3.0.0
	 */
	async send() {
		if (this.disabled) return;
		const message = await (this.starMessage ? this.starMessage.edit : this.starboard.channel.send)(
			`${this.emoji} **${this.amount}** ${this.message.channel} ID: ${this.message.id}`, { embed: this.embed }
		);
		if (!this.starMessage) this.starMessage = message;
	}

	/**
	 * Adds a user id from the list
	 * @since 3.0.0
	 * @param {string} userID The user id to add
	 * @returns {Promise<void>}
	 */
	async add(userID) {
		if (this.disabled) return undefined;
		if (this.users && !this.users.has(userID)) {
			this.users.set(userID);
			await this.update();
		}
		return this.send();
	}

	/**
	 * Remove a user id from the list
	 * @since 3.0.0
	 * @param {string} userID The user id to remove
	 * @returns {Promise<void>}
	 */
	async remove(userID) {
		if (this.disabled) return undefined;
		if (this.users && this.users.has(userID)) {
			this.users.delete(userID);
			await this.update();
		}
		return this.send();
	}

	/**
	 * Set the message from the starboard
	 * @since 3.0.0
	 * @param {Message} message The message from the starboard
	 * @returns {this}
	 * @chainable
	 */
	setStarMessage(message) {
		this.starMessage = message;
		return this;
	}

	/**
	 * Set the starred message
	 * @since 3.0.0
	 * @param {Message} message The starred message
	 * @returns {this}
	 * @chainable
	 */
	setStarredMessage(message) {
		this.message = message;
		return this;
	}

	/**
	 * Update the amount in the database
	 * @since 3.0.0
	 */
	async update() {
		if (this.UUID) await this.client.providers.default.db.table(TABLENAME).get(this.UUID).update({ amount: this.amount });
	}

	/**
	 * Init the entry
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 */
	async init() {
		if (!this.inited) await this.sync();
		if (!this.users) {
			const reaction = this.message.reactions.get('⭐');
			const users = await reaction.users.fetch();
			this.users = new Set([...users.keys()]);
		}

		this.inited = true;
		return this;
	}

	/**
	 * Synchronises the cache with the database
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 */
	async sync() {
		const [data] = await this.client.providers.default.db.table(TABLENAME).getAll([this.guild.id, this.message.id], { index: INDEXNAME })
			.limit(1).catch(() => []);

		if (!data) {
			await this.enable();
			return this;
		}

		this.UUID = data.id;
		this.disabled = Boolean(data.disabled);
		if (!this.starMessage) {
			this.starMessage = await this.starboard.channel.messages.fetch(data.starMessageID).catch(() => null);
		}

		return this;
	}

	/**
	 * Deletes the member instance from the database
	 * @since 3.0.0
	 * @param {boolean} [deleteMessage = true] Whether the star message should be deleted on deactivation
	 */
	async destroy(deleteMessage = true) {
		this.disabled = true;
		if (deleteMessage && this.starMessage) await this.starMessage.nuke();
		await this.disable();
	}

	/**
	 * Enables or initializes the entry in the DB
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async enable() {
		if (!this.UUID) {
			const result = await this.client.providers.default.db.table(TABLENAME).insert({
				guildID: this.guild.id,
				messageID: this.message.id,
				amount: this.amount,
				starMessageID: this.starMessage.id
			});
			this.UUID = result.generated_keys[0];
			this.disabled = false;
			return true;
		}
		if (this.disabled) {
			await this.client.providers.default.db.table(TABLENAME).get(this.UUID).update({ disabled: false });
			this.disabled = false;
			return true;
		}
		return false;
	}

	/**
	 * Disables the entry
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async disable() {
		if (!this.disabled && this.UUID) {
			await this.client.providers.default.db.table(TABLENAME).get(this.UUID).update({ disabled: true });
			this.disabled = true;
			return true;
		}
		return false;
	}

	/**
	 * Disposes the entry to free memory
	 * @since 3.0.0
	 * @returns {this}
	 */
	dispose() {
		if (this.disabled) return this;
		this.disabled = true;

		this.starboard.delete(this.message.id);
		if (this.starMessage) this.starMessage = null;
		if (this.inited) this.inited = false;

		return this;
	}

	/**
	 * Filter the embeds to get a image
	 * @since 3.0.0
	 * @param {MessageEmbed[]} embeds The embeds to filter
	 * @returns {?string}
	 * @private
	 */
	static filterEmbeds(embeds) {
		const embed = embeds.find(emb => emb.type === 'image');
		return embed ? embed.url : null;
	}

	/**
	 * Filter the attachments to get a image
	 * @since 3.0.0
	 * @param {MessageAttachment[]} attachments The attachments to filter
	 * @returns {?string}
	 * @private
	 */
	static filterAttachments(attachments) {
		const attachment = attachments.find(att => IMAGE_EXTENSION.test(att.url));
		return attachment ? attachment.url : null;
	}

}

module.exports = StarboardMessage;
