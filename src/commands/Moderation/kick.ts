import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['k'],
			description: language => language.tget('COMMAND_KICK_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_KICK_EXTENDED'),
			requiredGuildPermissions: ['KICK_MEMBERS'],
			requiredMember: true
		});
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, reason: string | null) {
		return message.guild!.security.actions.kick({
			user_id: target.id,
			moderator_id: message.author.id,
			reason
		}, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: unknown) {
		const member = await super.checkModeratable(message, target, prehandled);
		if (member && !member.kickable) throw message.language.tget('COMMAND_KICK_NOT_KICKABLE');
		return member;
	}

}
