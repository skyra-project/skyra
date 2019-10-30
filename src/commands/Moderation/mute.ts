import { Permissions, TextChannel, User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { Moderation } from '../../lib/util/constants';
import { createMuteRole } from '../../lib/util/util';

const PERMISSIONS = Permissions.resolve([
	Permissions.FLAGS.MANAGE_ROLES,
	Permissions.FLAGS.MANAGE_CHANNELS
]);

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_MUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MUTE_EXTENDED'),
			modType: Moderation.TypeCodes.Mute,
			optionalDuration: true,
			permissionLevel: 5,
			requiredGuildPermissions: ['MANAGE_ROLES']
		});
	}

	public async inhibit(message: KlasaMessage) {
		if (message.command !== this) return false;
		const id = message.guild!.settings.get(GuildSettings.Roles.Muted);
		const role = (id && message.guild!.roles.get(id)) || null;
		if (!role) {
			if (!await message.hasAtLeastPermissionLevel(6)) throw message.language.tget('COMMAND_MUTE_LOWLEVEL');
			if (!(message.channel as TextChannel).permissionsFor(message.guild!.me!)!.has(PERMISSIONS)) throw message.language.tget('COMMAND_MUTECREATE_MISSING_PERMISSION');
			if (message.guild!.roles.size >= 250) throw message.language.tget('COMMAND_MUTE_CONFIGURE_TOOMANY_ROLES');
			await message.ask(message.language.tget('COMMAND_MUTE_CONFIGURE'))
				.catch(() => { throw message.language.tget('COMMAND_MUTE_CONFIGURE_CANCELLED'); });
			await message.sendLocale('SYSTEM_LOADING');
			await createMuteRole(message);
		}

		return false;
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, _member: GuildMember, reason: string, _prehandled: undefined, duration: number | null) {
		const extraData = await message.guild!.security.actions.mute(user.id, reason);
		return this.sendModlog(message, user, reason, extraData, duration);
	}

	public async posthandle() { /* Do nothing */ }

}
