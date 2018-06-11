const { ModerationCommand, Moderation } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['MANAGE_ROLES'],
			description: msg => msg.language.get('COMMAND_UNMUTE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_UNMUTE_EXTENDED'),
			modType: ModerationCommand.types.UN_MUTE,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		if (!msg.guild.configs.roles.muted) throw msg.language.get('GUILD_SETTINGS_ROLES_MUTED');
		if (!msg.guild.roles.has(msg.guild.configs.roles.muted)) {
			await msg.guild.configs.reset('roles.muted');
			throw msg.language.get('GUILD_SETTINGS_ROLES_MUTED');
		}

		const member = await this.checkModeratable(msg, target);
		const [mutedUsed] = await this.client.moderation.getCases(msg.guild.id, {
			[Moderation.schemaKeys.USER]: target.id,
			[Moderation.schemaKeys.TYPE]: Moderation.typeKeys.MUTE,
			[Moderation.schemaKeys.APPEAL]: false
		});
		if (!mutedUsed) throw msg.language.get('GUILD_MUTE_NOT_FOUND');
		await msg.guild.configs.update('mutes', member.id, msg.guild, { action: 'remove' });

		const roles = (mutedUsed[Moderation.schemaKeys.EXTRA_DATA] || []).concat(member.roles.filter(role => role.managed).map(role => role.id));

		await member.edit({ roles });
		const modlog = await this.sendModlog(msg, target, reason.length ? reason.join(' ') : null);

		return msg.sendMessage(msg.language.get('COMMAND_UNMUTE_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

};
