const { ModerationCommand, util: { createMuteRole } } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			botPerms: ['MANAGE_ROLES'],
			description: 'Mute the mentioned user.',
			modType: ModerationCommand.types.MUTE,
			permLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		const member = await this.checkModeratable(msg, target);

		const mute = await this._getMuteRole(msg);
		if (msg.guild.configs.mutes.includes(member.id)) throw msg.language.get('COMMAND_MUTE_MUTED');

		// Parse the reason and get the roles
		reason = reason.length ? reason.join(' ') : null;
		const roles = this._getRoles(member);

		await member.edit({ roles: [mute.id] });
		const modlog = await this.sendModlog(msg, target, reason, roles);

		return msg.sendMessage(msg.language.get('COMMAND_MUTE_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

	async _getMuteRole(msg) {
		if (!msg.guild.configs.roles.muted) return this._askMuteRoleCreation(msg);
		const role = msg.guild.roles.get(msg.guild.configs.roles.muted);
		if (!role) return this._askMuteRoleCreation(msg);
		return role;
	}

	async _askMuteRoleCreation(msg) {
		await msg.prompt(msg.language.get('COMMAND_MUTE_CONFIGURE'))
			.catch(() => { throw msg.language.get('COMMAND_MUTE_CONFIGURE_CANCELLED'); });
		await msg.sendMessage(msg.language.get('SYSTEM_PROCESSING'));
		return createMuteRole(msg);
	}

	_getRoles(member) {
		const roles = [...member.roles.keys()];
		roles.splice(roles.indexOf(member.guild.id), 1);
		return roles;
	}

};
