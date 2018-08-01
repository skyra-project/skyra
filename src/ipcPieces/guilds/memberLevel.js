const { API, config: { ownerID } } = require('../../index');
const { Permissions: { FLAGS } } = require('discord.js');

module.exports = class extends API {

	run({ guildID, memberID, level }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const member = guild.members.get(memberID);
			if (member) return this.hasLevel(guild, member, level);
			return null;
		}
		return null;
	}

	hasLevel(guild, member, level) {
		for (let i = level; i < LEVELS.length; i++) {
			const entry = LEVELS[i];
			if (entry === EMPTY) continue;
			if (entry(guild, member)) return true;
		}

		return false;
	}

};

const EMPTY = Symbol('empty');
const LEVELS = [];
LEVELS[0] = () => true;
LEVELS[1] = EMPTY;
LEVELS[2] = EMPTY;
LEVELS[3] = EMPTY;
LEVELS[4] = (guild, member) => guild.configs.roles.staff ? member.roles.has(guild.configs.roles.staff) : member.permissions.has(FLAGS.MANAGE_MESSAGES);
LEVELS[5] = (guild, member) => guild.configs.roles.moderator ? member.roles.has(guild.configs.roles.moderator) : member.permissions.has(FLAGS.BAN_MEMBERS);
LEVELS[6] = (guild, member) => guild.configs.roles.admin ? member.roles.has(guild.configs.roles.admin) : member.permissions.has(FLAGS.MANAGE_GUILD);
LEVELS[7] = (guild, member) => member.id === guild.ownerID;
LEVELS[8] = EMPTY;
LEVELS[9] = (__, member) => member.id === ownerID;
LEVELS[10] = (__, member) => member.id === ownerID;
