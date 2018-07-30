const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['MUTE_MEMBERS'],
			description: (language) => language.get('COMMAND_VMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_VMUTE_EXTENDED'),
			modType: ModerationCommand.types.VOICE_MUTE,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		const member = await this.checkModeratable(msg, target);
		if (member.serverMute) throw msg.language.get('COMMAND_MUTE_MUTED');

		reason = reason.length ? reason.join(' ') : null;
		await member.setMute(true, reason);
		const modlog = await this.sendModlog(msg, target, reason);

		return msg.sendLocale('COMMAND_MUTE_MESSAGE', [target, modlog.reason, modlog.caseNumber]);
	}

};
