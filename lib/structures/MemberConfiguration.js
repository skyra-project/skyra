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
		 * @name MemberConfiguration#guild
		 * @readonly
		 */
		Object.defineProperty(this, 'guild', { value: member.guild.id });

		/**
		 * The member id.
		 * @since 3.0.0
		 * @type {string}
		 * @name MemberConfiguration#id
		 * @readonly
		 */
		Object.defineProperty(this, 'id', { value: member.id });

		/**
		 * The amount of points
		 * @since 3.0.0
		 * @type {number}
		 */
		this.count = 0;

		/**
		 * Whether the user exists in the database.
		 * @since 3.0.0
		 * @type {boolean}
		 * @name MemberConfiguration#_existsInDB
		 * @private
		 */
		Object.defineProperty(this, '_existsInDB', { value: false, writable: true });

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
	 * Get the postgresql provider
	 * @since 3.0.0
	 * @returns {Provider}
	 * @readonly
	 * @private
	 */
	get _provider() {
		return this.client.providers.get('postgresql');
	}

	/**
	 * Get the member
	 * @since 3.0.0
	 * @returns {GuildMember}
	 * @readonly
	 */
	get member() {
		return this.client.guilds.get(this.guild).members.get(this.id);
	}

	/**
	 * Synchronize the MemberConfiguration instance with the database
	 * @since 3.0.0
	 * @returns {Promise<boolean>}
	 */
	async sync() {
		const entry = await this._runQuery('runOne',
			`SELECT * FROM "localScores" WHERE "id" = "${this.id}" AND "guild" = "${this.guild}" LIMIT 1;`);

		if (entry) {
			if (!this._existsInDB) this._existsInDB = true;
			this.count = entry.count;
			return true;
		}

		return false;
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
		await this._runQuery('run', this._existsInDB
			? `SELECT * FROM "localScores" SET "count" = ${amount | 0} WHERE "id" = "${this.id}" AND "guild" = "${this.guild}" LIMIT 1;`
			: `INSERT INTO "localScores" ("id", "guild", "count") VALUES ("${this.id}", "${this.guild}", ${amount | 0});`);

		return this;
	}

	/**
	 * Deletes the member instance from the database
	 * @since 3.0.0
	 */
	async destroy() {
		if (this._existsInDB) {
			await this._runQuery('run',
				`DELETE FROM "localScores" WHERE "id" = "${this.id}" AND "guild" = "${this.guild}";`);
			this._syncStatus = false;
			this._existsInDB = false;
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
		return `MemberConfiguration(${this.guild}::${this.id})`;
	}

	/**
	 * Runs a query and sets the sync status
	 * @since 3.0.0
	 * @param {('run'|'runAll'|'runOne')} type The type of query
	 * @param {string} query The query to execute
	 * @returns {Promise}
	 */
	_runQuery(type, query) {
		this._syncStatus = this._provider[type](query);
		this._syncStatus.then(() => { this._syncStatus = null; });
		return this._syncStatus;
	}

}

module.exports = MemberConfiguration;
