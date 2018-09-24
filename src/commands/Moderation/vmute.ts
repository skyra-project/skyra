const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MUTE_MEMBERS'],
			description: (language) => language.get('COMMAND_VMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_VMUTE_EXTENDED'),
			modType: ModerationCommand.types.VOICE_MUTE,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async handle(msg, user, member, reason) {
		if (member.voice.serverMute) throw msg.language.get('COMMAND_MUTE_MUTED');
		await member.setMute(true, reason);
		return this.sendModlog(msg, user, reason);
	}

};
