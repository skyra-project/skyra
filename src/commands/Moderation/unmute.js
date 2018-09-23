const { ModerationCommand, util: { removeMute } } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			description: (language) => language.get('COMMAND_UNMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UNMUTE_EXTENDED'),
			modType: ModerationCommand.types.UN_MUTE,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		if (!msg.guild.settings.roles.muted) throw msg.language.get('GUILD_SETTINGS_ROLES_MUTED');
		if (!msg.guild.roles.has(msg.guild.settings.roles.muted)) {
			await msg.guild.settings.reset('roles.muted');
			throw msg.language.get('GUILD_SETTINGS_ROLES_MUTED');
		}

		const member = await this.checkModeratable(msg, target);
		const modlog = (await msg.guild.moderation.fetch(target.id)).filter(log => log.type === ModerationCommand.types.MUTE).last();
		if (!modlog) throw msg.language.get('GUILD_MUTE_NOT_FOUND');
		await removeMute(member.guild, member.id);

		// Cache and concatenate with the current roles
		const { position } = msg.guild.me.roles.highest;
		const roles = [...new Set((modlog.extraData || [])
			// Map by Role instances
			.map(id => msg.guild.roles.get(id))
			// Concatenate with the member's roles
			.concat(...member.roles.values()))]
			// Filter removed and unmanageable roles
			.filter(role => role && role.position < position && !role.managed)
			// Map by id
			.map(role => role.id);

		// Remove the muted role
		const muteIndex = roles.indexOf(msg.guild.settings.roles.muted);
		if (muteIndex !== -1) roles.splice(muteIndex, 1);

		// Edit roles
		await member.edit({ roles });
		const unmuteLog = await this.sendModlog(msg, target, reason.length ? reason.join(' ') : null);

		return msg.sendLocale('COMMAND_UNMUTE_MESSAGE', [target, unmuteLog.reason, unmuteLog.case]);
	}

};
