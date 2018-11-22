import { ModerationCommand } from '../../index';

export default class extends ModerationCommand {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['KICK_MEMBERS'],
			description: (language) => language.get('COMMAND_KICK_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_KICK_EXTENDED'),
			modType: ModerationCommand.types.KICK,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async handle(msg, user, member, reason) {
		if (!member.kickable) throw msg.language.get('COMMAND_KICK_NOT_KICKABLE');
		await member.kick(reason);
		return this.sendModlog(msg, user, reason);
	}

}
