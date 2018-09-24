const { ModerationCommand, util: { removeMute } } = require('../../index');

module.exports = class extends ModerationCommand {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			description: (language) => language.get('COMMAND_UNMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UNMUTE_EXTENDED'),
			modType: ModerationCommand.types.UN_MUTE,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async inhibit(msg) {
		const id = msg.guild.settings.roles.muted;
		if (id && msg.guild.roles.has(id)) return false;
		throw msg.language.get('GUILD_SETTINGS_ROLES_MUTED');
	}

	public async handle(msg, user, member, reason) {
		const modlog = (await msg.guild.moderation.fetch(user.id)).filter((log) => log.type === ModerationCommand.types.MUTE).last();
		if (!modlog) throw msg.language.get('GUILD_MUTE_NOT_FOUND');
		await removeMute(member.guild, member.id);

		// Cache and concatenate with the current roles
		const { position } = msg.guild.me.roles.highest;
		const roles = [...new Set((modlog.extraData || [])
			// Map by Role instances
			.map((id) => msg.guild.roles.get(id))
			// Concatenate with the member's roles
			.concat(...member.roles.values()))]
			// Filter removed and unmanageable roles
			.filter((role) => role && role.position < position && !role.managed)
			// Map by id
			.map((role) => role.id);

		// Remove the muted role
		const muteIndex = roles.indexOf(msg.guild.settings.roles.muted);
		if (muteIndex !== -1) roles.splice(muteIndex, 1);

		// Edit roles
		await member.edit({ roles });
		return this.sendModlog(msg, user, reason);
	}

};
