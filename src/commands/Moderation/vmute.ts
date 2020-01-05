import { ModerationCommand } from '@lib/structures/ModerationCommand';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['vm'],
			description: language => language.tget('COMMAND_VMUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_VMUTE_EXTENDED'),
			optionalDuration: true,
			requiredMember: true,
			requiredGuildPermissions: ['MUTE_MEMBERS']
		});
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, reason: string | null, duration: number | null) {
		return message.guild!.security.actions.voiceMute({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		}, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: unknown) {
		const member = await super.checkModeratable(message, target, prehandled);
		if (member && member.voice.serverMute) throw message.language.tget('COMMAND_MUTE_MUTED');
		return member;
	}

}
