import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { PermissionLevels } from '../../lib/types/Enums';
import { User } from 'discord.js';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_MUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MUTE_EXTENDED'),
			optionalDuration: true,
			requiredGuildPermissions: ['MANAGE_ROLES']
		});
	}

	public async inhibit(message: KlasaMessage) {
		if (message.guild === null) return true;
		const id = message.guild.settings.get(GuildSettings.Roles.Muted);
		const role = (id && message.guild!.roles.get(id)) || null;
		if (!role) {
			if (!await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator)) throw message.language.tget('COMMAND_MUTE_LOWLEVEL');
			if (!await message.ask(message.language.tget('COMMAND_MUTE_CONFIGURE'))) throw message.language.tget('COMMAND_MUTE_CONFIGURE_CANCELLED');
			await message.sendLocale('SYSTEM_LOADING');
			await message.guild.security.actions.muteSetup();
			await message.sendLocale('COMMAND_SUCCESS');
		}

		return false;
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, target: User, reason: string, duration: number | null) {
		return message.guild!.security.actions.mute({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		}, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

}
