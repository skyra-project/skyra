/**
 * @class GuildSecurity
 * @version 2.0.0
 */
class GuildSecurity {

	public constructor(guild) {
		/**
		 * The SkyraGuild instance which manages this instance
		 * @type {SKYRA.SkyraGuild}
		 */
		this.guild = guild;

		/**
		 * The Adder instance used to control spam
		 * @type {?SKYRA.Adder}
		 */
		this.adder = null;

		/**
		 * The AntiRaid instance managed by this guild, if exists
		 * @type {AntiRaid}
		 */
		this.raid = new AntiRaid(this.guild);

		/**
		 * The NoMentionSpam instance managed by this guild, if exists
		 * @type {NoMentionSpam}
		 */
		this.nms = new NoMentionSpam();

		/**
		 * The lockdowns map
		 * @type {Map<string, NodeJS.Timer>}
		 */
		this.lockdowns = new Map();
	}

	/**
	 * Destroy all managers
	 */
	public dispose() {
		this.clearNMS();
		this.clearRaid();
		this.clearLockdowns();
	}

	/**
	 * Destroy the Raid instance
	 */
	public clearRaid() {
		this.raid.clear();
	}

	/**
	 * Destroy the NoMentionSpam instance
	 */
	public clearNMS() {
		this.nms.clear();
	}

	/**
	 * Destroy all lockdowns
	 */
	public clearLockdowns() {
		// Clear all timeouts
		const prefix = `lockdown-${this.guild.id}`;
		for (const key of this.guild.client.timeoutManager.keys())
			if (key.startsWith(prefix)) this.guild.client.timeoutManager.delete(key);
	}

}

export GuildSecurity;

import AntiRaid from './Security/AntiRaid';
import NoMentionSpam from './Security/NoMentionSpam';
