import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { Moderation } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['warning'],
			description: language => language.tget('COMMAND_WARN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WARN_EXTENDED'),
			modType: Moderation.TypeCodes.Warn,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, _member: GuildMember, reason: string | null, _prehandled: undefined, duration: number | null) {
		return message.guild!.security.actions.warning({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		});
	}

	public async posthandle() { /* Do nothing */ }

}
