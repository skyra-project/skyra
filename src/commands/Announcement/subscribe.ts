const { Command, util: { announcementCheck } } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_SUBSCRIBE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SUBSCRIBE_EXTENDED'),
			runIn: ['text']
		});
	}

	public async run(msg: SkyraMessage) {
		const role = announcementCheck(msg);
		await msg.member.roles.add(role);
		return msg.sendLocale('COMMAND_SUBSCRIBE_SUCCESS', [role.name]);
	}

}
