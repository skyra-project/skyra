const { ModerationCommand, util: { softban } } = require('../../index');

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

	async prehandle(msg) {
		return msg.guild.settings.events.banAdd || msg.guild.settings.events.banRemove ? { unlock: msg.guild.moderation.createLock() } : null;
	}

	async handle(msg, user, member, reason) {
		if (member && !member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');
		return softban(msg.guild, msg.author, user, reason, 'days' in msg.flags ? Math.min(7, Math.max(0, Number(msg.flags.days))) : 1);
	}

	async posthandle(msg, targets, reason, prehandled) {
		if (prehandled) prehandled.unlock();
	}

};
