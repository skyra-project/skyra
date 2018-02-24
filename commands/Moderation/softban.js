const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			botPerms: ['BAN_MEMBERS'],
			description: 'Softbans the mentioned user.',
			modType: ModerationCommand.types.SOFT_BAN,
			permLevel: 5,
			requiredMember: false,
			runIn: ['text'],
			usage: '<SearchMember:user> [days:integer] [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, days = 1, ...reason]) {
		const member = await this.checkModeratable(msg, target);
		if (member && !member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');

		reason = reason.length ? reason.join(' ') : null;
		await msg.guild.members.ban(target.id, { days, reason: `${reason ? `Softban with reason: ${reason}` : null}` });
		await msg.guild.members.unban(target.id, 'Softban.');
		const modlog = await this.sendModlog(msg, target, reason);

		return msg.sendMessage(msg.language.get('COMMAND_SOFTBAN_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

};
