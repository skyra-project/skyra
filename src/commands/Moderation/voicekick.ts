import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_VOICEKICK_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_VOICEKICK_EXTENDED'),
			modType: ModerationTypeKeys.VoiceKick,
			permissionLevel: 5,
			requiredMember: true,
			requiredPermissions: ['MANAGE_CHANNELS', 'MOVE_MEMBERS']
		});
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, member: SkyraGuildMember, reason: string) {
		if (!member.voice.channelID) throw message.language.tget('GUILD_MEMBER_NOT_VOICECHANNEL');
		await member.voice.setChannel(null);
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
