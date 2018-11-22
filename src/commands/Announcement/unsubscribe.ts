import { Command, util : { announcementCheck }; } from; '../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_UNSUBSCRIBE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UNSUBSCRIBE_EXTENDED'),
			runIn: ['text']
		});
	}

	public async run(msg) {
		const role = announcementCheck(msg);
		await msg.member.roles.remove(role);
		return msg.sendLocale('COMMAND_UNSUBSCRIBE_SUCCESS', [role.name]);
	}

}
