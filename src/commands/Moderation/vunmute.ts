import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['uvm', 'vum', 'unvmute'],
			description: language => language.tget('COMMAND_VUNMUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_VUNMUTE_EXTENDED'),
			requiredMember: true,
			requiredPermissions: ['MUTE_MEMBERS']
		});
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, reason: string | null) {
		return message.guild!.security.actions.unVoiceMute({
			user_id: target.id,
			moderator_id: message.author.id,
			reason
		}, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: unknown) {
		const member = await super.checkModeratable(message, target, prehandled);
		if (member && !member.voice.serverMute) throw message.language.tget('GUILD_MUTE_NOT_FOUND');
		return member;
	}

}
