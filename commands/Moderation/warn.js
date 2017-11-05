const { structures: { Command }, management: { ModerationLog } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['warning'],
			guildOnly: true,
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

		if (user.id === msg.author.id) throw i18n.get('COMMAND_USERSELF');
		else if (user.id === this.client.user.id) throw i18n.get('COMMAND_TOSKYRA');
		else if (member.highestRole.position >= msg.member.highestRole.position) throw i18n.get('COMMAND_ROLE_HIGHER');

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

		return msg.send(i18n.get('COMMAND_WARN_MESSAGE', user, reason, modcase));
	}

};
