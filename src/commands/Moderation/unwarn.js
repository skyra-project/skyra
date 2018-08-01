const { ModerationCommand, Moderation: { schemaKeys, typeKeys } } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_UNWARN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UNWARN_EXTENDED'),
			modType: ModerationCommand.types.UN_WARN,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<case:number> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [caseID, ...reason]) {
		const [warn] = await this.client.moderation.getCases(msg.guild.id, {
			[schemaKeys.TYPE]: typeKeys.WARN,
			[schemaKeys.CASE]: caseID,
			[schemaKeys.APPEAL]: false
		});
		if (!warn) throw msg.language.get('GUILD_WARN_NOT_FOUND');
		await this.client.moderation.updateCase(msg.guild.id, { ...warn, [schemaKeys.APPEAL]: true });
		const user = await this.client.users.fetch(warn[schemaKeys.USER]);
		const modlog = await this.sendModlog(msg, user, reason);

		return msg.sendLocale('COMMAND_UNWARN_MESSAGE', [user, modlog.reason, modlog.caseNumber]);
	}

};
