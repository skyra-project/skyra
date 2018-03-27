const { MessageEmbed } = require('discord.js');

const TABLENAME = 'starboard', TABLEINDEX = { index: 'channel_message' };

// Colors
const MAXCOLORS = 15, STEP = 80 / MAXCOLORS;
const COLORS = [];
for (let i = 0; i < MAXCOLORS; i++) COLORS.push((0xFFE3AF + (i * STEP)) | 0);
const LASTCOLOR = COLORS[MAXCOLORS - 1];

// Filter
const IMAGE_EXTENSION = /(\.bmp|\.jpg|\.jpeg|\.png|\.gif|\.webp)$/i;

module.exports = class StarboardMessage {

	constructor(manager, message) {
		this.manager = manager;
		this.channel = message.channel;
		this.message = message;
		this.disabled = false;

		this.starMessage = null;
		this.UUID = null;
		this.stars = 0;
	}

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
		if (this.starMessage) return this.starMessage.embeds[0]
			.setColor(this.color);
		if (!this.message) return null;
		return new MessageEmbed()
			.setAuthor(this.message.author.username, this.message.author.displayAvatarURL())
			.setColor(this.color)
			.setDescription(this.message.content)
			.setTimestamp(this.message.createdAt)
			.setImage(StarboardMessage.filterAttachments(this.message.attachments)
				|| StarboardMessage.filterEmbeds(this.message.embeds));
	}

	async sync() {
		const [data] = await this.provider.db.table(TABLENAME).getAll([this.channel.id, this.message.id], TABLEINDEX)
			.limit(1).catch(() => []);

		if (data) {
			this.UUID = data.id;
			this.stars = data.stars;
			this.disabled = Boolean(data.disabled);

			const channel = this.manager.starboardChannel;
			const message = await channel.messages.fetch(data.starMessageID).catch(() => null);
			if (message) this.starMessage = message;
			else if (this.stars < this.manager.minimum) await channel.send(this.embed);
		}

		return this;
	}

	async disable() {
		if (this.disabled) return false;
		await this.provider.db.table(TABLENAME).get(this.UUID).update({ disabled: true });
		this.disabled = true;
		return true;
	}

	async enable() {
		if (!this.disabled) return false;
		await this.provider.db.table(TABLENAME).get(this.UUID).update({ disabled: false });
		this.disabled = false;
		return true;
	}

	async updateMessage() {
		if (this.disabled || this.stars < this.manager.minimum) return null;
		const content = `${this.emoji} **${this.stars}** ${this.channel} ID: ${this.message.id}`;
		if (this.starMessage) {
			await this.starMessage.edit(content, { embed: this.embed });
		} else {
			this.starMessage = await this.manager.starboardChannel.send(content, { embed: this.embed });
			this.provider.db.table(TABLENAME).get(this.UUID).update({ starMessageID: this.starMessage.id });
		}
		return true;
	}

	async setStars(stars) {
		if (this.disabled) return false;
		if (stars === this.stars) return false;
		this.stars = stars;
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

	dispose() {
		this.manager = null;
		this.channel = null;
		this.message = null;
		this.disabled = true;
		this.starMessage = null;
		this.UUID = null;
		this.stars = 0;
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

};
