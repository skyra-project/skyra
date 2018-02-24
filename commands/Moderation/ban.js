const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			botPerms: ['BAN_MEMBERS'],
			description: 'Ban the mentioned user.',
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

		await msg.guild.members.ban(target.id, { days: 1, reason: reason.join(' ') });
		const modlog = await this.sendModlog(msg, target, reason);

		return msg.sendMessage(msg.language.get('COMMAND_BAN_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

};
