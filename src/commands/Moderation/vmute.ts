import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { Moderation } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_VMUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_VMUTE_EXTENDED'),
			modType: Moderation.TypeCodes.VoiceMute,
			optionalDuration: true,
			permissionLevel: 5,
			requiredMember: true,
			requiredGuildPermissions: ['MUTE_MEMBERS']
		});
	}

	public async prehandle() { /* Do nothing */ }

	public handle(message: KlasaMessage, target: User, _member: GuildMember, reason: string | null, _prehandled: undefined, duration: number | null) {
		return message.guild!.security.actions.voiceMute({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		});
	}

	public async posthandle() { /* Do nothing */ }

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: unknown) {
		const member = await super.checkModeratable(message, target, prehandled);
		if (member && member.voice.serverMute) throw message.language.tget('COMMAND_MUTE_MUTED');
		return member;
	}

}
