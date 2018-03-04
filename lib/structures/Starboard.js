const { TextChannel } = require('discord.js');
const StarboardMessage = require('./StarboardMessage');

/**
 * The Starboard class that manages the starboard channel
 * @since 3.0.0
 * @extends {Map<string, StarboardMessage>}
 * @version 3.0.0
 */
class Starboard extends Map {

	/**
	 * Create a new Starboard instance
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild instance that manages this instance
	 */
	constructor(guild) {
		super();

		/**
		 * The client that initialised this instance
		 * @since 3.0.0
		 * @type {Skyra}
		 */
		this.client = guild.client;

		/**
		 * The Guild instance that manages this instance
		 * @since 3.0.0
		 * @type {KlasaGuild}
		 */
		this.guild = guild;

		/**
		 * The starboard channel
		 * @since 3.0.0
		 * @type {?TextChannel}
		 */
		this.channel = null;

		/**
		 * Whether this instance is initialised
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.inited = false;

		/**
		 * The promise sync status, if syncing.
		 * @since 3.0.0
		 * @type {boolean}
		 * @name Starboard#_syncStatus
		 * @private
		 */
		Object.defineProperty(this, '_syncStatus', { value: null, writable: true });

		this._syncStatus = this._init().then(() => { this._syncStatus = null; });
	}

	/**
	 * Add a new point to a message
	 * @since 3.0.0
	 * @param {Message} message The message to add a point to
	 * @param {string} userID The user ID to add
	 */
	async add(message, userID) {
		await (this.get(message.id) || await this._add(message)).add(userID);
	}

	/**
	 * Add a new point to a message
	 * @since 3.0.0
	 * @param {Message} message The message to add a point to
	 * @param {string} userID The user ID to remove
	 */
	async remove(message, userID) {
		await (this.get(message.id) || await this._add(message)).remove(userID);
	}

	/**
	 * Set the new channel
	 * @since 3.0.0
	 * @param {string|TextChannel} channel The channel to set
	 * @returns {this}
	 */
	async setChannel(channel) {
		const oldChannel = this.channel;
		if (typeof channel === 'string') channel = this.guild.channels.get(channel);
		if (channel instanceof TextChannel) this.channel = channel;
		if (oldChannel !== channel) {
			this.inited = false;
			await this._init();
		}

		return this;
	}

	clear() {
		for (const starboardMessage of this.values()) starboardMessage.dispose();
	}

	dispose() {
		this.clear();
	}

	async _init() {
		if (this.inited || !this.guild.configs.starboard.channel) return;
		// Empty the cache
		this.clear();

		// Get the channel, reset the config if it's not readable
		const channel = this.guild.channels.get(this.guild.configs.starboard.channel);
		if (!channel || channel.readable) {
			await this.guild.configs.reset('starboard.channel');
			return;
		}
		this.channel = channel;
	}

	/**
	 * Add a new entry to the starboard
	 * @since 3.0.0
	 * @param {Message} message The message
	 * @returns {StarboardMessage}
	 * @private
	 */
	async _add(message) {
		const starboardMessage = new StarboardMessage(this)
			.setStarredMessage(message);
		await starboardMessage.init();
		await starboardMessage.send();
		super.set(message.id, starboardMessage);
		return starboardMessage;
	}

}

module.exports = Starboard;
