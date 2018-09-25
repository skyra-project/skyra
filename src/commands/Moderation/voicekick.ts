const { ModerationCommand } = require('../../index');

export default class extends ModerationCommand {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_CHANNELS', 'MOVE_MEMBERS'],
			description: (language) => language.get('COMMAND_VOICEKICK_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_VOICEKICK_EXTENDED'),
			modType: ModerationCommand.types.VOICE_KICK,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public prehandle(msg, users, reason) {
		return msg.guild.channels.create('temp', {
			overwrites: [{ id: msg.guild.id, deny: 0x00000400 }, ...users.map((user) => ({ id: user.id, allow: 0x00000400 }))],
			reason,
			type: 'voice',
			userLimit: 1
		});
	}

	public async handle(msg, user, member, reason, voiceChannel) {
		if (!member.voice.channelID) throw msg.language.get('GUILD_MEMBER_NOT_VOICECHANNEL');
		await member.setVoiceChannel(voiceChannel);
		return this.sendModlog(msg, user, reason);
	}

	public posthandle(msg, users, reason, voiceChannel) {
		return voiceChannel.delete('Temporal Voice Channel Deletion');
	}

}
