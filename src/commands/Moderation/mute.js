const { ModerationCommand, util: { createMuteRole, mute } } = require('../../index');
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
		if (msg.command !== this) return false;
		const id = msg.guild.settings.roles.muted;
		const role = (id && msg.guild.roles.get(id)) || null;
		if (!role) {
			if (!await msg.hasAtLeastPermissionLevel(6)) throw msg.language.get('COMMAND_MUTE_LOWLEVEL');
			if (!msg.channel.permissionsFor(msg.guild.me).has(PERMISSIONS)) throw msg.language.get('COMMAND_MUTECREATE_MISSING_PERMISSION');
			if (msg.guild.roles.size >= 250) throw msg.language.get('COMMAND_MUTE_CONFIGURE_TOOMANY_ROLES');
			await msg.prompt(msg.language.get('COMMAND_MUTE_CONFIGURE'))
				.catch(() => { throw msg.language.get('COMMAND_MUTE_CONFIGURE_CANCELLED'); });
			await msg.sendLocale('SYSTEM_LOADING');
			await createMuteRole(msg);
		}

		return false;
	}

	handle(msg, user, member, reason) {
		return mute(msg.member, member, reason);
	}

};
