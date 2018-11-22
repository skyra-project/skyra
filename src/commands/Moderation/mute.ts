import { ModerationCommand, util : { createMuteRole, mute }; } from; '../../index';
import { Permissions } from 'discord.js';

const PERMISSIONS = Permissions.resolve([
	Permissions.FLAGS.MANAGE_ROLES,
	Permissions.FLAGS.MANAGE_CHANNELS
]);

export default class extends ModerationCommand {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			description: (language) => language.get('COMMAND_MUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MUTE_EXTENDED'),
			modType: ModerationCommand.types.MUTE,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async inhibit(msg) {
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

	public handle(msg, user, member, reason) {
		return mute(msg.member, member, reason);
	}

}
