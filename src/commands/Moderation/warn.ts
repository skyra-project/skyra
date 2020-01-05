import { ModerationCommand } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['w', 'warning'],
			description: language => language.tget('COMMAND_WARN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WARN_EXTENDED'),
			permissionLevel: PermissionLevels.Moderator,
			requiredMember: true,
			optionalDuration: true
		});
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, reason: string | null, duration: number | null) {
		return message.guild!.security.actions.warning({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		}, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

}
