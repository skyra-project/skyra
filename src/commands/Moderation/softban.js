const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['BAN_MEMBERS'],
			description: (language) => language.get('COMMAND_SOFTBAN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SOFTBAN_EXTENDED'),
			modType: ModerationCommand.types.SOFT_BAN,
			permissionLevel: 5,
			requiredMember: false
		});
	}

	async handle(msg, user, member, reason) {
		if (member && !member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');
		await msg.guild.members.ban(user.id, {
			days: 'days' in msg.flags ? Math.min(7, Math.max(0, Number(msg.flags.days))) : 0,
			reason: `${reason ? `Softban with reason: ${reason}` : null}`
		});
		await msg.guild.members.unban(user.id, 'Softban.');

		return this.sendModlog(msg, user, reason);
	}

};
