const { Command, ModLog } = require('../../index');

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

		if (user.id === msg.author.id) throw i18n.get('COMMAND_USERSELF');
		else if (user.id === this.client.user.id) throw i18n.get('COMMAND_TOSKYRA');
		else if (member.highestRole.position >= msg.member.highestRole.position) throw i18n.get('COMMAND_ROLE_HIGHER');

		if (member.serverMute) throw i18n.get('COMMAND_MUTE_MUTED');

		reason = reason.length ? reason.join(' ') : null;
		await member.setMute(true, reason);

		const modcase = await new ModLog(msg.guild)
			.setModerator(msg.author)
			.setUser(user)
			.setType('vmute')
			.setReason(reason)
			.send();

		return msg.send(i18n.get('COMMAND_MUTE_MESSAGE', user, reason, modcase));
	}

};
