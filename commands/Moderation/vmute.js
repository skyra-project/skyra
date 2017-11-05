const { structures: { Command }, management: { ModerationLog, moderationCheck } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 2,
			botPerms: ['MUTE_MEMBERS'],
			mode: 2,
			cooldown: 5,

			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' ',
			description: 'Voice Mute the mentioned user.'
		});
	}

	async run(msg, [user, ...reason], settings, i18n) {
		const member = await msg.guild.members.fetch(user.id).catch(() => { throw i18n.get('USER_NOT_IN_GUILD'); });
		moderationCheck(this.client, msg, msg.member, member, i18n);

		if (member.serverMute) throw i18n.get('COMMAND_MUTE_MUTED');

		reason = reason.length ? reason.join(' ') : null;
		await member.setMute(true, reason);

		const modcase = await new ModerationLog(msg.guild)
			.setModerator(msg.author)
			.setUser(user)
			.setType('vmute')
			.setReason(reason)
			.send();

		return msg.send(i18n.get('COMMAND_MUTE_MESSAGE', user, reason, modcase));
	}

};
