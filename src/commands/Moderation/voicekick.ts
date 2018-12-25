import { Client, User, VoiceChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_VOICEKICK_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_VOICEKICK_EXTENDED'),
			modType: ModerationTypeKeys.VoiceKick,
			permissionLevel: 5,
			requiredMember: true,
			requiredPermissions: ['MANAGE_CHANNELS', 'MOVE_MEMBERS']
		});
	}

	public prehandle(message: KlasaMessage, users: User[], reason: string): Promise<VoiceChannel> {
		return message.guild.channels.create('temp', {
			permissionOverwrites: [{ id: message.guild.id, deny: 0x00000400 }, ...users.map((user) => ({ id: user.id, allow: 0x00000400 }))],
			reason,
			type: 'voice',
			userLimit: 1
		}) as Promise<VoiceChannel>;
	}

	public async handle(message: KlasaMessage, user: User, member: SkyraGuildMember, reason: string, voiceChannel: VoiceChannel) {
		if (!member.voice.channelID) throw message.language.get('GUILD_MEMBER_NOT_VOICECHANNEL');
		await member.setVoiceChannel(voiceChannel);
		return this.sendModlog(message, user, reason);
	}

	public posthandle(_: KlasaMessage, __: User[], ___: string, voiceChannel: VoiceChannel) {
		return voiceChannel.delete('Temporal Voice Channel Deletion');
	}

}
