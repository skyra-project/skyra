const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			avoidAnonymous: true,
			botPerms: ['BAN_MEMBERS'],
			description: msg => msg.language.get('COMMAND_BAN_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_BAN_EXTENDED'),
			modType: ModerationCommand.types.BAN,
			permLevel: 5,
			requiredMember: false,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		const member = await this.checkModeratable(msg, target);
		if (member && !member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');

		const modlog = await this.sendModlog(msg, target, reason);
		await msg.guild.members.ban(target.id, {
			days: (msg.flags.day && Number(msg.flags.day)) || 0,
			reason: reason.join(' ')
		});

		return msg.sendMessage(msg.language.get('COMMAND_BAN_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

};
