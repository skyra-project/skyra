const cache = new Map();

class AntiRaid {

	constructor(guild, settings) {
		this.guild = guild;
		this.settings = settings;

		this.users = new Map();

		this.attack = false;
		this.timeout = null;
	}

	add(member) {
		const timer = this.clear(member);
		this.users.set(member.id, timer);
		if (this.settings.selfmod.raidthreshold >= this.users.size || this.attack === true) return this.execute();
		return false;
	}

	remove(member) {
		if (this.users.has(member.id)) {
			clearInterval(this.users.get(member.id));
			this.users.delete(member.id);
		}
		return this;
	}

	async execute() {
		if (this.guild.me.permissions.has('KICK_MEMBERS') === false) return false;
		this.fire();
		const kicked = [];

		const min = !!this.defaultRole + 1;

		for (const id of this.users.keys()) {
			const member = await this.check(id, min);
			if (member === null) continue;
			await member.kick(`[ANTI-RAID] Threshold: ${this.settings.selfmod.raidthreshold}`)
				.then(() => {
					kicked.push(`${member.user.tag} (${member.id})`);
					this.remove(member);
				})
				.catch(() => null);
		}

		return kicked;
	}

	fire() {
		if (this.attack === false) this.attack = true;
		if (this.timeout !== null) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => this.cool(), 20000);
	}

	cool() {
		if (this.timeout !== null) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
		if (this.attack === true) this.attack = false;

		return this;
	}

	check(id, min) {
		return this.guild.members.fetch(id)
			.then((member) => {
				if (member.roles.size >= min) return null;
				if (this.defaultRole && member.roles.size === 2 && member.roles.has(this.defaultRole) === false) return null;
				return member;
			})
			.catch(() => null);
	}

	clear(member) {
		return setTimeout(() => this.remove(member), 20000);
	}

	get defaultRole() {
		return this.settings.roles.initial;
	}

	prune() {
		for (const id of this.users.keys()) {
			clearInterval(this.users.get(id));
			this.users.delete(id);
		}

		return this;
	}

}

class Manager {

	/**
     * @static
     * @param {Guild} guild Guild
     * @param {Settings} settings Guild Settings
     * @returns {AntiRaid}
     */
	static get(guild, settings) {
		return cache.get(guild.id) || this.set(guild, settings);
	}

	/**
     * @static
     * @param {Guild} guild Guild
     * @param {Settings} settings Guild Settings
     * @returns {AntiRaid}
     */
	static set(guild, settings) {
		const data = new AntiRaid(guild, settings);
		cache.set(guild.id, data);
		return data;
	}

	/**
     * @static
     * @param {Guild} guild Guild
     * @param {Settings} settings Guild Settings
     * @param {GuildMember} member The Member Object
     * @returns {Promise<(false|any[])>}
     */
	static add(guild, settings, member) {
		return this.get(guild, settings).add(member);
	}

	/**
     * @static
     * @param {Guild} guild Guild
     * @param {Settings} settings Guild Settings
     * @param {GuildMember} member The Member Object
     * @returns {AntiRaid}
     */
	static remove(guild, settings, member) {
		return this.get(guild, settings).remove(member);
	}

	static nuke(guild) {
		return cache.delete(guild);
	}

}

module.exports = Manager;
