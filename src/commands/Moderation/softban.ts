import { ModerationCommand, util : { softban }; } from; '../../index';

export default class extends ModerationCommand {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['BAN_MEMBERS'],
			description: (language) => language.get('COMMAND_SOFTBAN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SOFTBAN_EXTENDED'),
			modType: ModerationCommand.types.SOFT_BAN,
			permissionLevel: 5,
			requiredMember: false
		});
	}

	public async prehandle(msg) {
		return msg.guild.settings.events.banAdd || msg.guild.settings.events.banRemove ? { unlock: msg.guild.moderation.createLock() } : null;
	}

	public async handle(msg, user, member, reason) {
		if (member && !member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');
		return softban(msg.guild, msg.author, user, reason, 'days' in msg.flags ? Math.min(7, Math.max(0, Number(msg.flags.days))) : 1);
	}

	public async posthandle(msg, targets, reason, prehandled) {
		if (prehandled) prehandled.unlock();
	}

}
