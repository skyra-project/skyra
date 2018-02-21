const { structures: { Command }, management: { ModerationLog, moderationCheck } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['warning'],
			runIn: ['text'],
			permLevel: 1,
			mode: 2,
			cooldown: 5,

			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' ',
			description: 'Warn the mentioned user.'
		});
	}

	async run(msg, [user, ...reason], settings, i18n) {
		const member = await msg.guild.members.fetch(user.id).catch(() => { throw i18n.get('USER_NOT_IN_GUILD'); });
		moderationCheck(this.client, msg, msg.member, member, i18n);

		reason = reason.length ? reason.join(' ') : null;

		if (settings.messages.warnings === true && reason !== null)
			await user.send(i18n.get('COMMAND_WARN_DM', msg.author.tag, msg.guild, reason))
				.catch(() => null);

		const modcase = await new ModerationLog(msg.guild)
			.setModerator(msg.author)
			.setUser(user)
			.setType('warn')
			.setReason(reason)
			.send();

		return msg.sendMessage(i18n.get('COMMAND_WARN_MESSAGE', user, reason, modcase));
	}

};

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

		await msg.guild.ban(target.id, { days: 1, reason: reason.join(' ') });
		const modlog = await this.sendModlog(msg, target, reason);

		return msg.sendMessage(msg.language.get('COMMAND_BAN_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

};
