const { structures: { Command }, management: { ModerationLog, moderationCheck } } = require('../../index');

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
			description: 'Unmute the mentioned user.'
		});
	}

	async run(msg, [user, ...reason], settings, i18n) {
		const member = await msg.guild.members.fetch(user.id).catch(() => { throw i18n.get('USER_NOT_IN_GUILD'); });
		moderationCheck(this.client, msg, msg.member, member, i18n);

		if (!settings.roles.muted) throw i18n.get('GUILD_SETTINGS_ROLES_MUTED');
		const role = msg.guild.roles.get(settings.roles.muted);
		if (!role) {
			await settings.update({ roles: { muted: null } });
			throw i18n.get('GUILD_SETTINGS_ROLES_MUTED');
		}

		const mutedUsed = await settings.moderation.getMute(user.id);
		if (!mutedUsed) throw i18n.get('GUILD_MUTE_NOT_FOUND');

		const roles = mutedUsed.extraData || [];

		reason = reason.length ? reason.join(' ') : null;
		await member.edit({ roles });

		const modcase = await new ModerationLog(msg.guild)
			.setModerator(msg.author)
			.setUser(user)
			.setType('unmute')
			.setReason(reason)
			.send();

		return msg.send(i18n.get('COMMAND_UNMUTE_MESSAGE', user, reason, modcase));
	}

};
