const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MUTE_MEMBERS'],
			description: (language) => language.get('COMMAND_VUNMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_VUNMUTE_EXTENDED'),
			modType: ModerationCommand.types.UN_VOICE_MUTE,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async handle(msg, user, member, reason) {
		if (!member.voice.serverMute) throw msg.language.get('GUILD_MUTE_NOT_FOUND');
		await member.setMute(false, reason);
		return this.sendModlog(msg, user, reason);
	}

};
