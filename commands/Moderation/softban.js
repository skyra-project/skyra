const { structures: { Command }, management: { ModerationLog } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 2,
			botPerms: ['BAN_MEMBERS'],
			mode: 2,
			cooldown: 5,

			usage: '<SearchMember:user> [days:integer] [reason:string] [...]',
			usageDelim: ' ',
			description: 'Softbans the mentioned user.'
		});
	}

	async run(msg, [user, days = 7, ...reason], settings, i18n) {
		const member = await msg.guild.members.fetch(user.id).catch(() => { throw i18n.get('USER_NOT_IN_GUILD'); });

		if (user.id === msg.author.id) throw i18n.get('COMMAND_USERSELF');
		else if (user.id === this.client.user.id) throw i18n.get('COMMAND_TOSKYRA');
		else if (member) {
			if (member.highestRole.position >= msg.member.highestRole.position) throw i18n.get('COMMAND_ROLE_HIGHER');
			else if (!member.bannable) throw i18n.get('COMMAND_BAN_NOT_BANNABLE');
		}

		reason = reason.length ? reason.join(' ') : null;
		user.action = 'softban';
		await msg.guild.ban(user, { days, reason: `${reason ? `Softban with reason: ${reason}` : null}` });
		await msg.guild.unban(user, 'Softban.');

		const modcase = await new ModerationLog(msg.guild)
			.setModerator(msg.author)
			.setUser(user)
			.setType('softban')
			.setReason(reason)
			.send();

		return msg.send(i18n.get('COMMAND_SOFTBAN_MESSAGE', user, reason, modcase));
	}

};
