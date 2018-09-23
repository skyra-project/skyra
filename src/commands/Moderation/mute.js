const { ModerationCommand, util: { createMuteRole } } = require('../../index');
const { Permissions } = require('discord.js');

const PERMISSIONS = Permissions.resolve([
	Permissions.FLAGS.MANAGE_ROLES,
	Permissions.FLAGS.MANAGE_CHANNELS
]);

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			description: (language) => language.get('COMMAND_MUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MUTE_EXTENDED'),
			modType: ModerationCommand.types.MUTE,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...raw]) {
		const member = await this.checkModeratable(msg, target);

		const mute = await this._getMuteRole(msg);
		if (!mute) throw msg.language.get('COMMAND_MUTE_UNCONFIGURED');
		const stickyRolesIndex = msg.guild.settings.stickyRoles.findIndex(stickyRole => stickyRole.id === member.id);
		const stickyRoles = stickyRolesIndex !== -1 ? msg.guild.settings.stickyRoles[stickyRolesIndex] : { id: member.id, roles: [] };
		if (stickyRoles.roles.includes(mute.id)) throw msg.language.get('COMMAND_MUTE_MUTED');

		// Parse the reason and get the roles
		const reason = raw.length ? raw.join(' ') : null;
		const roles = this._getRoles(member);

		await member.edit({ roles: member.roles.filter(role => role.managed).map(role => role.id).concat(mute.id) });
		const modlog = await this.sendModlog(msg, target, reason, roles);
		const entry = { id: member.id, roles: stickyRoles.roles.concat(mute.id) };
		await msg.guild.settings.update('stickyRoles', entry, stickyRolesIndex !== -1 ? { arrayPosition: stickyRolesIndex } : { action: 'add' });

		return msg.sendLocale('COMMAND_MUTE_MESSAGE', [target, modlog.reason, modlog.case]);
	}

	async _getMuteRole(msg) {
		if (!msg.guild.settings.roles.muted) return this._askMuteRoleCreation(msg);
		const role = msg.guild.roles.get(msg.guild.settings.roles.muted);
		if (!role) return this._askMuteRoleCreation(msg);
		return role;
	}

	async _askMuteRoleCreation(msg) {
		if (!await msg.hasAtLeastPermissionLevel(6)) throw msg.language.get('COMMAND_MUTE_LOWLEVEL');
		if (!msg.channel.permissionsFor(msg.guild.me).has(PERMISSIONS)) return null;
		await msg.prompt(msg.language.get('COMMAND_MUTE_CONFIGURE'))
			.catch(() => { throw msg.language.get('COMMAND_MUTE_CONFIGURE_CANCELLED'); });
		await msg.sendLocale('SYSTEM_PROCESSING');
		return createMuteRole(msg);
	}

	_getRoles(member) {
		const roles = [...member.roles.keys()];
		roles.splice(roles.indexOf(member.guild.id), 1);
		return roles;
	}

};
