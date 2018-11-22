import { ModerationCommand } from '../../index';

export default class extends ModerationCommand {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['BAN_MEMBERS'],
			description: (language) => language.get('COMMAND_UNBAN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UNBAN_EXTENDED'),
			modType: ModerationCommand.types.UN_BAN,
			permissionLevel: 5,
			requiredMember: false
		});
	}

	public async prehandle(msg) {
		const bans = await msg.guild.fetchBans().catch(() => { throw msg.language.get('SYSTEM_FETCHBANS_FAIL'); });
		if (bans.size) return { bans, unlock: msg.guild.settings.events.banRemove ? msg.guild.moderation.createLock() : null };
		throw msg.language.get('GUILD_BANS_EMPTY');
	}

	public async handle(msg, user, member, reason, { bans }) {
		if (!bans.has(user.id)) throw msg.language.get('GUILD_BANS_NOT_FOUND');
		await msg.guild.members.unban(user.id, reason);
		return this.sendModlog(msg, user, reason);
	}

	public async posthandle(msg, targets, reason, prehandled) {
		if (prehandled) prehandled.unlock();
	}

}
