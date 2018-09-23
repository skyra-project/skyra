const { ModerationCommand, constants: { MODERATION: { TYPE_KEYS } } } = require('../../index');

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
		const modlog = await msg.guild.moderation.fetch(caseID);
		if (!modlog || modlog.type !== TYPE_KEYS.WARN) throw msg.language.get('GUILD_WARN_NOT_FOUND');

		// Appeal the modlog and send a log to the moderation log channel
		await modlog.appeal();
		const user = await this.client.users.fetch(modlog.user);
		const unwarnLog = await this.sendModlog(msg, user, reason);

		return msg.sendLocale('COMMAND_UNWARN_MESSAGE', [user, unwarnLog.reason, unwarnLog.case]);
	}

};
