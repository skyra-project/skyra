const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			avoidAnonymous: true,
			botPerms: ['BAN_MEMBERS'],
			description: 'Unbans an user (you MUST write his full Discord Tag or his ID).',
			modType: ModerationCommand.types.UN_BAN,
			permLevel: 5,
			requiredMember: false,
			runIn: ['text'],
			usage: '<SearchMember:string> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		const { user, banReason } = await this.fetchBan(msg.guild, target);

		reason = reason.length > 0 ? reason.join(' ') : null;
		const modlog = await this.sendModlog(msg, user, reason);
		await msg.guild.members.unban(user, reason);

		return msg.sendMessage(msg.language.get('COMMAND_UNBAN_MESSAGE', user, modlog.reason, modlog.caseNumber, banReason));
	}

	async fetchBan(guild, query) {
		const users = await guild.fetchBans().catch(() => { throw 'SYSTEM_FETCHBANS_FAIL'; });
		if (!users.size) throw guild.language.get('GUILD_BANS_EMPTY');
		const entry = users.get(query) || users.find(mem => mem.user.tag === query) || null;
		if (!entry) throw guild.language.get('GUILD_BANS_NOT_FOUND');
		return { user: entry.user, banReason: entry.reason };
	}

};
