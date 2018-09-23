const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['KICK_MEMBERS'],
			description: (language) => language.get('COMMAND_KICK_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_KICK_EXTENDED'),
			modType: ModerationCommand.types.KICK,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	async handle(msg, user, member, reason) {
		if (!member.kickable) throw msg.language.get('COMMAND_KICK_NOT_KICKABLE');
		await member.kick(reason);
		return this.sendModlog(msg, user, reason);
	}

};
