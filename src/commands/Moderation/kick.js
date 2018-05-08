const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['KICK_MEMBERS'],
			description: msg => msg.language.get('COMMAND_KICK_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_KICK_EXTENDED'),
			modType: ModerationCommand.types.KICK,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		const member = await this.checkModeratable(msg, target);
		if (!member.kickable) throw msg.language.get('COMMAND_KICK_NOT_KICKABLE');
		reason = reason.length ? reason.join(' ') : null;

		await member.kick(reason);
		const modlog = await this.sendModlog(msg, target, reason);

		return msg.sendMessage(msg.language.get('COMMAND_KICK_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

};
