const { ModerationCommand, Moderation } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			botPerms: ['BAN_MEMBERS'],
			description: 'Ban the mentioned user.',
			modType: ModerationCommand.types.UN_WARN,
			permLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<case:number> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [caseID, ...reason]) {
		const [warn] = await this.client.moderation.getCases({
			[Moderation.schemaKeys.GUILD]: msg.guild.id,
			[Moderation.schemaKeys.TYPE]: Moderation.typeKeys.WARN,
			[Moderation.schemaKeys.CASE]: caseID,
			[Moderation.schemaKeys.APPEAL]: false
		});
		if (!warn) throw 'This warn does not exist.';
		const user = await this.client.users.fetch(warn[Moderation.schemaKeys.USER]);
		const modlog = await this.sendModlog(msg, user, reason);

		return msg.sendMessage(msg.language.get('COMMAND_BAN_MESSAGE', user, modlog.reason, modlog.caseNumber));
	}

};
