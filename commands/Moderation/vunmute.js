const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			botPerms: ['MUTE_MEMBERS'],
			description: msg => msg.language.get('COMMAND_VUNMUTE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_VUNMUTE_EXTENDED'),
			modType: ModerationCommand.types.UN_VOICE_MUTE,
			permLevel: 5,
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

		return msg.sendMessage(msg.language.get('COMMAND_UNMUTE_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

};
