const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['KICK_MEMBERS'],
			description: (language) => language.get('COMMAND_KICK_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_KICK_EXTENDED'),
			modType: ModerationCommand.types.KICK,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...raw]) {
		const member = await this.checkModeratable(msg, target);
		if (!member.kickable) throw msg.language.get('COMMAND_KICK_NOT_KICKABLE');

		const reason = raw.length ? raw.join(' ') : null;
		await member.kick(reason);
		const modlog = await this.sendModlog(msg, target, reason);

		return msg.sendLocale('COMMAND_KICK_MESSAGE', [target, modlog.reason, modlog.caseNumber]);
	}

};
