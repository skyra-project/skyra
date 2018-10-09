/// <reference path="../../index.d.ts" />
const { util } = require('klasa');
const SORT = (x, y) => +(y.count > x.count) || +(x.count === y.count) - 1;

/**
 * The MemberSettings class that manages per-member settings
 * @since 1.6.0
 * @version 5.0.0
 */
class MemberSettings {

	/**
	 * @typedef  {Object} MemberSettingsJSON
	 * @property {number} count
	 * @property {string} guild
	 * @property {string} member
	 */

	constructor(member) {
		Object.defineProperties(this, {
			client: { writable: true },
			guildID: { writable: true },
			userID: { writable: true },
			UUID: { writable: true },
			_syncStatus: { writable: true }
		});

		/**
		 * The client this MemberSettings was created with.
		 * @since 3.0.0
		 * @type {SKYRA.Skyra}
		 * @readonly
		 */
		this.client = member.client;

		/**
		 * The guild id where the member belongs to.
		 * @since 3.0.0
		 * @type {string}
		 * @readonly
		 */
		this.guildID = member.guild.id;

		/**
		 * The member id.
		 * @since 3.0.0
		 * @type {string}
		 * @readonly
		 */
		this.userID = member.id;

		/**
		 * The amount of points
		 * @since 3.0.0
		 * @type {number}
		 */
		this.count = 0;

		/**
		 * The UUID for this entry.
		 * @since 3.0.0
		 * @type {string}
		 * @private
		 */
		this.UUID = null;

		/**
		 * The promise sync status, if syncing.
		 * @since 3.0.0
		 * @type {?Promise<this>}
		 * @private
		 */
		this._syncStatus = null;

		// Sync the settings
		this.sync();
	}

	/**
	 * Get the member
	 * @since 3.0.0
	 * @returns {SKYRA.SkyraGuildMember}
	 * @readonly
	 */
	get member() {
		return this.client.guilds.get(this.guildID).members.get(this.userID);
	}

	/**
	 * Synchronize the MemberSettings instance with the database
	 * @since 3.0.0
	 * @param {boolean} [force=false] Whether the sync should download from the database or not
	 * @returns {Promise<this>}
	 */
	sync(force = false) {
		if (!this.client._skyraReady) return Promise.resolve(this);
		if (this._syncStatus) return this._syncStatus;
		if (!force) return Promise.resolve(this);
		this._syncStatus = this._sync();
		return this._syncStatus;
	}

	/**
	 * Update the member instance
	 * @since 3.0.0
	 * @param {number} amount The amount of points to increase
	 * @returns {Promise<this>}
	 */
	async update(amount) {
		if (this._syncStatus) throw new Error(`[${this}] MemberSettings#update cannot execute due to out-of-sync entry.`);
		if (!util.isNumber(amount)) throw new TypeError(`[${this}] MemberSettings#update expects a number.`);
		if (amount < 0) throw new TypeError(`[${this}] MemberSettings#update expects a positive number.`);
		await (this.UUID
			? this.client.providers.default.db.table('localScores').get(this.UUID).update({ count: amount | 0 }).run()
			: this.client.providers.default.db.table('localScores').insert({ guildID: this.guildID, userID: this.userID, count: amount | 0 }).run()
				.then(result => { [this.UUID] = result.generated_keys; }));
		this.count = amount | 0;

		return this;
	}

	/**
	 * Deletes the member instance from the database
	 * @since 3.0.0
	 */
	async destroy() {
		if (this.UUID) {
			await this.client.providers.default.db.table('localScores').get(this.UUID).delete().run();
			this.UUID = null;
		}
		this.count = 0;
	}

	/**
	 * toJSON() override for MemberSettings
	 * @since 3.0.0
	 * @returns {MemberSettingsJSON}
	 */
	toJSON() {
		const guild = this.client.guilds.get(this.guildID);
		const member = guild ? guild.members.get(this.userID) : null;

		return {
			guild: guild ? guild.id : null,
			member: member ? member.id : null,
			count: this.count
		};
	}

	/**
	 * toString() override for MemberSettings
	 * @since 3.0.0
	 * @returns {string}
	 */
	toString() {
		return `MemberSettings(${this.guildID}::${this.userID})`;
	}

	_patch(data) {
		if (typeof data.id !== 'undefined') this.UUID = data.id;
		if (typeof data.count === 'number') this.count = data.count;
	}

	/**
	 * Internal sync method
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 * @private
	 */
	async _sync() {
		const data = this.resolveData(await this.client.providers.default.db.table('localScores').getAll([this.guildID, this.userID], { index: 'guild_user' }).run()
			.catch(() => []));

		if (data) {
			this.UUID = data.id;
			this.count = data.count;
		}

		this._syncStatus = null;
		return this;
	}

	resolveData(entries) {
		if (!entries.length) return null;
		if (entries.length === 1) return entries[0];
		const sorted = entries.sort(SORT);
		const [highest] = sorted.splice(0, 1);
		const table = this.client.providers.default.db.table('localScores');
		for (const entry of sorted) {
			this.client.emit('verbose', `[CORRUPTION] [localScores - ${entry.guildID}:${entry.userID}] (${entry.id}) ${entry.count} < ${highest.count}.`);
			table.get(entry.id).delete().run();
		}
		return highest;
	}

}

module.exports = MemberSettings;
