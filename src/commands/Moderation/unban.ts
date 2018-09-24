const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['BAN_MEMBERS'],
			description: (language) => language.get('COMMAND_UNBAN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UNBAN_EXTENDED'),
			modType: ModerationCommand.types.UN_BAN,
			permissionLevel: 5,
			requiredMember: false
		});
	}

	async prehandle(msg) {
		const bans = await msg.guild.fetchBans().catch(() => { throw msg.language.get('SYSTEM_FETCHBANS_FAIL'); });
		if (bans.size) return bans;
		throw msg.language.get('GUILD_BANS_EMPTY');
	}

	async handle(msg, user, member, reason, bans) {
		if (!bans.has(user.id)) throw msg.language.get('GUILD_BANS_NOT_FOUND');
		await msg.guild.members.unban(user.id, reason);
		return this.sendModlog(msg, user, reason);
	}

};
