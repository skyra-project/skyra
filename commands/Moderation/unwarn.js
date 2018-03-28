const { ModerationCommand, Moderation } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_UNWARN_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_UNWARN_EXTENDED'),
			modType: ModerationCommand.types.UN_WARN,
			permLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<case:number> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [caseID, ...reason]) {
		const [warn] = await this.client.moderation.getCases(msg.guild.id, {
			[Moderation.schemaKeys.TYPE]: Moderation.typeKeys.WARN,
			[Moderation.schemaKeys.CASE]: caseID,
			[Moderation.schemaKeys.APPEAL]: false
		});
		if (!warn) throw msg.language.get('GUILD_WARN_NOT_FOUND');
		const user = await this.client.users.fetch(warn[Moderation.schemaKeys.USER]);
		const modlog = await this.sendModlog(msg, user, reason);

		return msg.sendMessage(msg.language.get('COMMAND_UNWARN_MESSAGE', user, modlog.reason, modlog.caseNumber));
	}

};
