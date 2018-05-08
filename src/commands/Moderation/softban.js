const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			avoidAnonymous: true,
			requiredPermissions: ['BAN_MEMBERS'],
			description: msg => msg.language.get('COMMAND_SOFTBAN_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_SOFTBAN_EXTENDED'),
			modType: ModerationCommand.types.SOFT_BAN,
			permissionLevel: 5,
			requiredMember: false,
			runIn: ['text'],
			usage: '<SearchMember:user> [days:integer{1,7}] [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, days = 1, ...reason]) {
		const member = await this.checkModeratable(msg, target);
		if (member && !member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');

		reason = reason.length ? reason.join(' ') : null;
		const modlog = await this.sendModlog(msg, target, reason);
		await msg.guild.members.ban(target.id, { days, reason: `${reason ? `Softban with reason: ${reason}` : null}` });
		await msg.guild.members.unban(target.id, 'Softban.');

		return msg.sendMessage(msg.language.get('COMMAND_SOFTBAN_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

};
