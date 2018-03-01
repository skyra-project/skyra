/**
 * @class GuildSecurity
 * @version 1.0.0
 */
class GuildSecurity {

	/**
	 * Create a new instance of GuildSecurity
	 * @since 3.0.0
	 * @param {SkyraGuild} guild The guild that manages this instance
	 */
	constructor(guild) {
		/**
		 * The SkyraGuild instance which manages this instance
		 * @since 3.0.0
		 * @type {SkyraGuild}
		 */
		this.guild = guild;

		/**
		 * The AntiRaid instance managed by this guild, if exists
		 * @since 3.0.0
		 * @type {AntiRaid}
		 * @private
		 */
		Object.defineProperty(this, '_raid', { value: null, writable: true });

		/**
		 * The NoMentionSpam instance managed by this guild, if exists
		 * @since 3.0.0
		 * @type {NoMentionSpam}
		 * @private
		 */
		Object.defineProperty(this, '_nms', { value: null, writable: true });

		/**
		 * The lockdowns map
		 * @since 3.0.0
		 * @type {Map<string, NodeJS.Timer>}
		 */
		Object.defineProperty(this, '_lockdowns', { value: null });
	}

	/**
	 * The AntiRaid instance managed by this guild
	 * @since 3.0.0
	 * @returns {AntiRaid}
	 * @readonly
	 */
	get raid() {
		if (!this._raid) this._raid = new AntiRaid(this.guild);
		return this._raid;
	}

	/**
	 * The NoMentionSpam instance managed by this guild
	 * @since 3.0.0
	 * @returns {NoMentionSpam}
	 * @readonly
	 */
	get nms() {
		if (!this._nms) this._nms = new NoMentionSpam();
		return this._nms;
	}

	/**
	 * The NoMentionSpam instance managed by this guild
	 * @since 3.0.0
	 * @returns {NoMentionSpam}
	 * @readonly
	 */
	get lockdowns() {
		if (!this._lockdowns) this._lockdowns = new Map();
		return this._nms;
	}

	/**
	 * Check if a channel is under lockdown
	 * @since 3.0.0
	 * @param {string} channel The channel to check for
	 * @returns {boolean}
	 */
	hasLockdown(channel) {
		return this._lockdowns && this._lockdowns.has(channel);
	}

	/**
	 * Check if a user is in the RAID queue
	 * @since 3.0.0
	 * @param {string} user The user ID to check for
	 * @returns {boolean}
	 */
	hasRAID(user) {
		return this._raid && this._raid.has(user);
	}

	/**
	 * Destroy all managers
	 * @since 3.0.0
	 */
	dispose() {
		this.clearNMS();
		this.clearRaid();
		this.clearLockdowns();
	}

	/**
	 * Destroy the Raid instance
	 * @since 3.0.0
	 */
	clearRaid() {
		if (!this._raid) return;
		this._raid.clear();
		this._raid = null;
	}

	/**
	 * Destroy the NoMentionSpam instance
	 * @since 3.0.0
	 */
	clearNMS() {
		if (!this._nms) return;
		this._nms.clear();
		this._nms = null;
	}

	/**
	 * Destroy all lockdowns
	 * @since 3.0.0
	 */
	clearLockdowns() {
		if (!this._lockdowns) return;
		for (const timer of this._lockdowns.values()) clearTimeout(timer);
		this._lockdowns.clear();
	}

}

module.exports = GuildSecurity;

const AntiRaid = require('./AntiRaid');
const NoMentionSpam = require('./NoMentionSpam');
