const { Command, ModLog, Assets: { createMuted } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 2,
			botPerms: ['MANAGE_ROLES'],
			mode: 2,
			cooldown: 5,

			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' ',
			description: 'Mute the mentioned user.'
		});
	}

	async run(msg, [user, ...reason], settings, i18n) {
		const member = await msg.guild.members.fetch(user.id).catch(() => { throw i18n.get('USER_NOT_IN_GUILD'); });

		if (user.id === msg.author.id) throw i18n.get('COMMAND_USERSELF');
		else if (user.id === this.client.user.id) throw i18n.get('COMMAND_TOSKYRA');
		else if (member.highestRole.position >= msg.member.highestRole.position) throw i18n.get('COMMAND_ROLE_HIGHER');

		const mute = await this.configuration(msg, settings, i18n);
		if (settings.moderation.mutes.has(user.id)) throw i18n.get('COMMAND_MUTE_MUTED');

		reason = reason.length ? reason.join(' ') : null;
		const roles = member._roles;
		await member.edit({ roles: [mute.id] });

		const modcase = await new ModLog(msg.guild)
			.setModerator(msg.author)
			.setUser(user)
			.setType('mute')
			.setReason(reason)
			.setExtraData(roles)
			.send();

		return msg.send(i18n.get('COMMAND_MUTE_MESSAGE', user, reason, modcase));
	}

	async configuration(msg, settings, i18n) {
		if (!settings.roles.muted) {
			await msg.prompt(i18n.get('COMMAND_MUTE_CONFIGURE'))
				.catch(() => { throw i18n.get('COMMAND_MUTE_CONFIGURE_CANCELLED'); });
			await msg.send(i18n.get('SYSTEM_PROCESSING'));
			return createMuted(msg);
		}
		return msg.guild.roles.get(settings.roles.muted);
	}

};
