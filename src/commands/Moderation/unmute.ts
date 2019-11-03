import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_UNMUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_UNMUTE_EXTENDED'),
			requiredGuildPermissions: ['MANAGE_ROLES']
		});
	}

	public inhibit(message: KlasaMessage) {
		const id = message.guild!.settings.get(GuildSettings.Roles.Muted);
		if (id && message.guild!.roles.has(id)) return false;
		throw message.language.tget('GUILD_SETTINGS_ROLES_MUTED');
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, reason: string | null, duration: number | null) {
		return message.guild!.security.actions.unMute({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		}, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

}
