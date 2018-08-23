const { ModerationCommand, Moderation, util: { removeMute } } = require('../../index');

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
		const [mutedUsed] = await this.client.moderation.getCases(msg.guild.id, {
			[Moderation.schemaKeys.USER]: target.id,
			[Moderation.schemaKeys.TYPE]: Moderation.typeKeys.MUTE,
			[Moderation.schemaKeys.APPEAL]: false
		});
		if (!mutedUsed) throw msg.language.get('GUILD_MUTE_NOT_FOUND');
		await removeMute(member.guild, member.id);

		const { position } = msg.guild.me.roles.highest;
		const roles = (mutedUsed[Moderation.schemaKeys.EXTRA_DATA] || [])
			.concat(member.roles.filter(role => role.position < position && !role.managed).map(role => role.id));

		await member.edit({ roles });
		const modlog = await this.sendModlog(msg, target, reason.length ? reason.join(' ') : null);

		return msg.sendLocale('COMMAND_UNMUTE_MESSAGE', [target, modlog.reason, modlog.caseNumber]);
	}

};
