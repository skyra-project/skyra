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
			requiredMember: true
		});
	}

	async inhibit(msg) {
		const id = msg.guild.settings.roles.muted;
		const role = (id && msg.guild.roles.get(id)) || null;
		if (!role) {
			if (!await msg.hasAtLeastPermissionLevel(6)) throw msg.language.get('COMMAND_MUTE_LOWLEVEL');
			if (!msg.channel.permissionsFor(msg.guild.me).has(PERMISSIONS)) throw msg.language.get('COMMAND_MUTECREATE_MISSING_PERMISSION');
			await msg.prompt(msg.language.get('COMMAND_MUTE_CONFIGURE'))
				.catch(() => { throw msg.language.get('COMMAND_MUTE_CONFIGURE_CANCELLED'); });
			await msg.sendLocale('SYSTEM_PROCESSING');
			await createMuteRole(msg);
		}

		return false;
	}

	async handle(msg, user, member, reason) {
		const mute = msg.guild.roles.get(msg.guild.settings.roles.muted);
		if (!mute) throw msg.language.get('COMMAND_MUTE_UNCONFIGURED');

		const stickyRolesIndex = msg.guild.settings.stickyRoles.findIndex(stickyRole => stickyRole.id === member.id);
		const stickyRoles = stickyRolesIndex !== -1 ? msg.guild.settings.stickyRoles[stickyRolesIndex] : { id: member.id, roles: [] };
		if (stickyRoles.roles.includes(mute.id)) throw msg.language.get('COMMAND_MUTE_MUTED');

		// Parse the roles
		const roles = this._getRoles(member);

		await member.edit({ roles: member.roles.filter(role => role.managed).map(role => role.id).concat(mute.id) });
		const entry = { id: member.id, roles: stickyRoles.roles.concat(mute.id) };
		const { errors } = await msg.guild.settings.update('stickyRoles', entry, stickyRolesIndex !== -1 ? { arrayPosition: stickyRolesIndex } : { action: 'add' });
		if (errors.length) throw errors[0];

		return this.sendModlog(msg, user, reason, roles);
	}

	_getRoles(member) {
		const roles = [...member.roles.keys()];
		roles.splice(roles.indexOf(member.guild.id), 1);
		return roles;
	}

};
