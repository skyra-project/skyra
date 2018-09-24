const { ModerationCommand, constants: { MODERATION: { TYPE_KEYS } } } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_UNWARN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UNWARN_EXTENDED'),
			modType: ModerationCommand.types.UN_WARN,
			permissionLevel: 5,
			requiredMember: true,
			usage: '<case:number> [reason:...string]'
		});
	}

	async run(msg, [caseID, reason]) {
		const modlog = await msg.guild.moderation.fetch(caseID);
		if (!modlog || modlog.type !== TYPE_KEYS.WARN) throw msg.language.get('GUILD_WARN_NOT_FOUND');

		const user = await this.client.users.fetch(modlog.user);
		const unwarnLog = await this.handle(msg, user, null, reason, modlog);

		return msg.sendLocale('COMMAND_MODERATION_OUTPUT', [[unwarnLog.case], unwarnLog.case, [`\`${user.tag}\``], unwarnLog.reason]);
	}

	async handle(msg, user, member, reason, modlog) {
		// Appeal the modlog and send a log to the moderation log channel
		await modlog.appeal();
		return this.sendModlog(msg, user, reason);
	}

};
