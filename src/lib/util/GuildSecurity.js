/**
 * @class GuildSecurity
 * @version 2.0.0
 */
class GuildSecurity {

	constructor(guild) {
		/**
		 * The SkyraGuild instance which manages this instance
		 * @since 3.0.0
		 * @type {SKYRA.SkyraGuild}
		 */
		this.guild = guild;

		/**
		 * The Adder instance used to control spam
		 * @since 4.0.0
		 * @type {?SKYRA.Adder}
		 */
		this.adder = null;

		/**
		 * The AntiRaid instance managed by this guild, if exists
		 * @since 3.0.0
		 * @type {AntiRaid}
		 */
		this.raid = new AntiRaid(this.guild);

		/**
		 * The NoMentionSpam instance managed by this guild, if exists
		 * @since 3.0.0
		 * @type {NoMentionSpam}
		 */
		this.nms = new NoMentionSpam();

		/**
		 * The lockdowns map
		 * @since 3.0.0
		 * @type {Map<string, NodeJS.Timer>}
		 */
		this.lockdowns = new Map();
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
		this.raid.clear();
	}

	/**
	 * Destroy the NoMentionSpam instance
	 * @since 3.0.0
	 */
	clearNMS() {
		this.nms.clear();
	}

	/**
	 * Destroy all lockdowns
	 * @since 3.0.0
	 */
	clearLockdowns() {
		// Clear all timeouts
		const prefix = `lockdown-${this.guild.id}`;
		for (const key of this.guild.client.timeoutManager.keys())
			if (key.startsWith(prefix)) this.guild.client.timeoutManager.delete(key);
	}

}

module.exports = GuildSecurity;

const AntiRaid = require('./Security/AntiRaid');
const NoMentionSpam = require('./Security/NoMentionSpam');
