import { Command, util : { createMuteRole }; } from; '../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			cooldown: 150,
			description: (language) => language.get('COMMAND_CREATEMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CREATEMUTE_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text']
		});
	}

	public async run(msg) {
		if (msg.guild.roles.size >= 250) throw msg.language.get('COMMAND_MUTE_CONFIGURE_TOOMANY_ROLES');
		await createMuteRole(await msg.sendLocale('SYSTEM_LOADING'));
		return msg.responses;
	}

}
