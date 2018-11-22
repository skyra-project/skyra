import { ModerationCommand } from '../../index';

export default class extends ModerationCommand {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['BAN_MEMBERS'],
			description: (language) => language.get('COMMAND_BAN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_BAN_EXTENDED'),
			modType: ModerationCommand.types.BAN,
			permissionLevel: 5,
			requiredMember: false
		});
	}

	public async prehandle(msg) {
		return msg.guild.settings.events.banAdd ? { unlock: msg.guild.moderation.createLock() } : null;
	}

	public async handle(msg, user, member, reason) {
		if (member && !member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');
		await msg.guild.members.ban(user.id, { days: (msg.flags.day && Number(msg.flags.day)) || 0, reason });

		return this.sendModlog(msg, user, reason);
	}

	public async posthandle(msg, targets, reason, prehandled) {
		if (prehandled) prehandled.unlock();
	}

}
