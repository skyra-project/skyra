import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { createMuteRole } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 150,
			description: (language) => language.get('COMMAND_CREATEMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CREATEMUTE_EXTENDED'),
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		if (message.guild.roles.size >= 250) throw message.language.get('COMMAND_MUTE_CONFIGURE_TOOMANY_ROLES');
		await createMuteRole(await message.sendLocale('SYSTEM_LOADING') as KlasaMessage);
		return message.responses;
	}

}
