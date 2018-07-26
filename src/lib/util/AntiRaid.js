const { GuildMember } = require('discord.js');

/**
 * The AntiRaid class that manages the raiding protection for guilds
 * @since 2.1.0
 * @extends {Map<string, NodeJS.Timer>}
 * @version 2.0.0
 */
class AntiRaid extends Map {

	/**
	 * Create a new AntiRaid instance
	 * @since 2.1.0
	 * @param {KlasaGuild} guild The Guild instance that manages this instance
	 */
	constructor(guild) {
		super();

		/**
		 * The Guild instance that manages this instance
		 * @since 2.1.0
		 * @type {KlasaGuild}
		 */
		this.guild = guild;

		/**
		 * Whether the guild is under attack or not
		 * @since 2.1.0
		 * @type {boolean}
		 */
		this.attack = false;

		/**
		 * The timeout that counts the RAID
		 * @since 2.1.0
		 * @type {NodeJS.Timer}
		 * @private
		 */
		this._timeout = null;
	}

	/**
	 * Get the default role ID, if configured
	 * @since 3.0.0
	 * @type {Object}
	 * @private
	 */
	get guildConfigs() {
		return this.guild.configs;
	}

	/**
	 * Add a member to the cache
	 * @since 2.1.0
	 * @param {(GuildMember|string)} member The member to add
	 * @returns {this}
	 */
	add(member) {
		const userID = member instanceof GuildMember ? member.id : member;
		const timer = setTimeout(() => this.delete(userID), 20000);
		return super.set(userID, timer);
	}

	/**
	 * Delete a member from the cache
	 * @since 2.1.0
	 * @param {(GuildMember|string)} member The member to delete
	 * @returns {this}
	 */
	delete(member) {
		const userID = member instanceof GuildMember ? member.id : member;
		const entry = super.get(userID);
		if (entry) {
			clearTimeout(entry);
			super.delete(userID);
		}
		return this;
	}

	/**
	 * Execute the RAID protection
	 * @since 2.1.0
	 * @returns {Promise<GuildMember[]>}
	 */
	async execute() {
		if (!this.guild.me.permissions.has('KICK_MEMBERS')) return null;

		// Stop the previous attack mode and reset to
		// clean status
		this.stop();

		// Set the attack mode to true
		this.attack = true;

		// Filter the users, and kick
		const kickedMembers = await this.prune();

		// Create the timeout for stopping the AntiRAID mode
		this._timeout = setTimeout(() => this.stop(), 20000);

		// Return the kicked members
		return kickedMembers;
	}

	/**
	 * Stop the attack mode
	 * @since 3.0.0
	 */
	stop() {
		if (this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		if (this.attack) this.attack = false;
	}

	/**
	 * Override to clear the timeouts for each member
	 * @since 3.0.0
	 * @returns {void}
	 */
	clear() {
		// Clear all timeouts q
		for (const timer of this.values())
			clearTimeout(timer);

		// Clear the attack mode and timeout
		this.stop();

		// Clear all entries
		return super.clear();
	}

	/**
	 * Kicks a member
	 * @since 3.0.0
	 * @param {GuildMember} member The member to kick
	 * @returns {GuildMember}
	 */
	async kick(member) {
		await member.kick(`[ANTI-RAID] Threshold: ${this.guildConfigs.selfmod.raidthreshold}`);
		this.delete(member.id);
		return member;
	}

	/**
	 * Filters the members
	 * @since 3.0.0
	 * @param {boolean} [kick=true] Whether the filter should kick the filtered members
	 * @returns {Promise<GuildMember[]>}
	 */
	async prune(kick = true) {
		const initialRole = this.guildConfigs.roles.initial;
		const minRolesAmount = initialRole ? 2 : 1;
		const kickedUsers = [];

		for (const memberID of super.keys()) {
			/**
			 * @type {GuildMember}
			 */
			const member = await this.guild.members.fetch(memberID).catch(noop);
			// Check if:
			// The member exists
			// The member is kickable
			// The member has more roles than the minimum they get at joining
			// If the defaultRole is defined and the member has two roles but doesn't have it
			//   ^ Only possible if the role got removed and added another, i.e. the Muted role
			//     or given by a moderator
			if (!member
				|| !member.kickable
				|| member.roles.size > minRolesAmount
				|| (initialRole && member.roles.size === minRolesAmount && !member.roles.has(initialRole)))
				super.delete(member.id);

			if (kick) {
				await this.kick(member)
					.then(() => kickedUsers.push(member))
					.catch(noop);
			}
		}

		return kickedUsers;
	}

}

function noop() { } // eslint-disable-line no-empty-function

module.exports = AntiRaid;
