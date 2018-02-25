const { util } = require('klasa');

/**
 * The MemberConfiguration class that manages per-member configs
 * @since 1.6.0
 * @version 5.0.0
 */
class MemberConfiguration {

	/**
	 * @typedef  {Object} MemberConfigurationJSON
	 * @property {number} count
	 */

	/**
	 * Create a new instance of MemberConfiguration given a GuildMember instance
	 * @since 3.0.0
	 * @param {GuildMember} member A GuildMember instance
	 */
	constructor(member) {
		/**
		 * The client this MemberConfiguration was created with.
		 * @since 3.0.0
		 * @type {KlasaClient}
		 * @name MemberConfiguration#client
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: member.client });

		/**
		 * The guild id where the member belongs to.
		 * @since 3.0.0
		 * @type {string}
		 * @name MemberConfiguration#guildID
		 * @readonly
		 */
		Object.defineProperty(this, 'guildID', { value: member.guild.id });

		/**
		 * The member id.
		 * @since 3.0.0
		 * @type {string}
		 * @name MemberConfiguration#userID
		 * @readonly
		 */
		Object.defineProperty(this, 'userID', { value: member.id });

		/**
		 * The amount of points
		 * @since 3.0.0
		 * @type {number}
		 */
		this.count = 0;

		/**
		 * The UUID for this entry.
		 * @since 3.0.0
		 * @type {boolean}
		 * @name MemberConfiguration#UUID
		 * @private
		 */
		Object.defineProperty(this, 'UUID', { value: null, writable: true });

		/**
		 * The promise sync status, if syncing.
		 * @since 3.0.0
		 * @type {boolean}
		 * @name MemberConfiguration#_syncStatus
		 * @private
		 */
		Object.defineProperty(this, '_syncStatus', { value: null, writable: true });
	}

	/**
	 * Get the member
	 * @since 3.0.0
	 * @returns {GuildMember}
	 * @readonly
	 */
	get member() {
		return this.client.guilds.get(this.guildID).members.get(this.userID);
	}

	/**
	 * Synchronize the MemberConfiguration instance with the database
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 */
	async sync() {
		const [data] = await this.client.providers.default.db.table('localScores').getAll([this.guildID, this.userID], { index: 'guild_user' })
			.limit(1).catch(() => []);

		if (data) {
			this.UUID = data.id;
			this.count = data.count;
		}
		return this;
	}

	/**
	 * Update the member instance
	 * @since 3.0.0
	 * @param {number} amount The amount of points to increase
	 * @returns {Promise<this>}
	 */
	async update(amount) {
		if (!util.isNumber(amount)) throw new TypeError(`[${this}] MemberConfiguration#update expects a number`);
		if (amount < 0) throw new TypeError(`[${this}] MemberConfiguration#update expects a positive number`);
		await (this.UUID
			? this.client.providers.default.db.table('localScores').get(this.UUID).update({ count: amount | 0 })
			: this.client.providers.default.db.table('localScores').insert({ guildID: this.guildID, userID: this.userID, count: amount | 0 })
				.then(result => { this.UUID = result.generated_keys[0]; }));
		this.count = amount | 0;

		return this;
	}

	/**
	 * Deletes the member instance from the database
	 * @since 3.0.0
	 */
	async destroy() {
		if (this.UUID) {
			await this.client.providers.default.db.table('localScores').get(this.UUID).delete();
			this.UUID = null;
		}
		this.count = 0;
	}

	/**
	 * toJSON() override for MemberConfiguration
	 * @since 3.0.0
	 * @returns {MemberConfigurationJSON}
	 */
	toJSON() {
		return { count: this.count };
	}

	/**
	 * toString() override for MemberConfiguration
	 * @since 3.0.0
	 * @returns {string}
	 */
	toString() {
		return `MemberConfiguration(${this.guildID}::${this.userID})`;
	}

}

module.exports = MemberConfiguration;
