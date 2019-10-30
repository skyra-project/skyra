import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { Moderation } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_UNMUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_UNMUTE_EXTENDED'),
			modType: Moderation.TypeCodes.UnMute,
			permissionLevel: 5,
			requiredMember: true,
			requiredGuildPermissions: ['MANAGE_ROLES']
		});
	}

	public inhibit(message: KlasaMessage) {
		const id = message.guild!.settings.get(GuildSettings.Roles.Muted);
		if (id && message.guild!.roles.has(id)) return false;
		throw message.language.tget('GUILD_SETTINGS_ROLES_MUTED');
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, target: User, _member: GuildMember, reason: string | null, _prehandled: undefined, duration: number | null) {
		const extraData = await message.guild!.security.actions.unmute(target.id, reason);
		return this.sendModlog(message, target, reason, extraData, duration);
	}

	public async posthandle() { /* Do nothing */ }

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: unknown) {
		const modlog = (await message.guild!.moderation.fetch(target.id))
			.filter(log => !log.invalidated && log.isType(Moderation.TypeCodes.Mute))
			.last();
		if (!modlog) throw message.language.tget('GUILD_MUTE_NOT_FOUND');
		const member = await super.checkModeratable(message, target, prehandled);
		return member;
	}

}
