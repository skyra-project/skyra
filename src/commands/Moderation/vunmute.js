const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['MUTE_MEMBERS'],
			description: (language) => language.get('COMMAND_VUNMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_VUNMUTE_EXTENDED'),
			modType: ModerationCommand.types.UN_VOICE_MUTE,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		const member = await this.checkModeratable(msg, target);
		if (!member.serverMute) throw msg.language.get('GUILD_MUTE_NOT_FOUND');

		reason = reason.length ? reason.join(' ') : null;
		await member.setDeaf(false, reason);
		const modlog = await this.sendModlog(msg, target, reason);

		return msg.sendLocale('COMMAND_UNMUTE_MESSAGE', [target, modlog.reason, modlog.caseNumber]);
	}

};
