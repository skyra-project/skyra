const { structures: { Command }, management: { ModerationLog, moderationCheck, assets: { createMuted } } } = require('../../index');

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
		moderationCheck(this.client, msg, msg.member, member, i18n);

		const mute = await this.configuration(msg, settings, i18n);
		if (settings.moderation.mutes.has(user.id)) throw i18n.get('COMMAND_MUTE_MUTED');

		reason = reason.length ? reason.join(' ') : null;
		const roles = member._roles;
		await member.edit({ roles: [mute.id] });

		const modcase = await new ModerationLog(msg.guild)
			.setModerator(msg.author)
			.setUser(user)
			.setType('mute')
			.setReason(reason)
			.setExtraData(roles)
			.send();

		return msg.send(i18n.get('COMMAND_MUTE_MESSAGE', user, reason, modcase));
	}

	async configuration(msg, settings, i18n) {
		if (!settings.roles.muted) return this.askMuted(msg, i18n);
		const role = msg.guild.roles.get(settings.roles.muted);
		if (!role) return this.askMuted(msg, i18n);
		return role;
	}

	async askMuted(msg, i18n) {
		await msg.prompt(i18n.get('COMMAND_MUTE_CONFIGURE'))
			.catch(() => { throw i18n.get('COMMAND_MUTE_CONFIGURE_CANCELLED'); });
		await msg.send(i18n.get('SYSTEM_PROCESSING'));
		return createMuted(msg);
	}

};
