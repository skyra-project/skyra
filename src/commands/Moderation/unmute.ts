import { Role, User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { ModerationTypeKeys } from '../../lib/util/constants';
import { removeMute } from '../../lib/util/util';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_UNMUTE_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_UNMUTE_EXTENDED'),
			modType: ModerationTypeKeys.UnMute,
			permissionLevel: 5,
			requiredMember: true,
			requiredGuildPermissions: ['MANAGE_ROLES']
		});
	}

	public inhibit(message: KlasaMessage) {
		const id = message.guild!.settings.get(GuildSettings.Roles.Muted) as GuildSettings.Roles.Muted;
		if (id && message.guild!.roles.has(id)) return false;
		throw message.language.get('GUILD_SETTINGS_ROLES_MUTED');
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, member: SkyraGuildMember, reason: string) {
		const modlog = (await message.guild!.moderation.fetch(user.id)).filter(log => log.type === ModerationTypeKeys.Mute || log.type === ModerationTypeKeys.TemporaryMute).last();
		if (!modlog) throw message.language.get('GUILD_MUTE_NOT_FOUND');
		await removeMute(member.guild, member.id);
		await modlog.appeal();

		// Cache and concatenate with the current roles
		const { position } = message.guild!.me!.roles.highest;
		const rawRoleIDs = modlog.extraData as string[] || [];
		const rawRoles = rawRoleIDs.map(id => message.guild!.roles.get(id)).filter(role => role) as Role[];
		const roles = new Set(member.roles.keys());
		for (const rawRole of rawRoles) {
			if (rawRole.position < position) roles.add(rawRole.id);
		}

		// Remove the muted role
		roles.delete(message.guild!.settings.get(GuildSettings.Roles.Muted) as GuildSettings.Roles.Muted);

		// Edit roles
		await member.edit({ roles: [...roles] });
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
