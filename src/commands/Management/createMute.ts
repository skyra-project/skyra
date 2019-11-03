import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 150,
			description: language => language.tget('COMMAND_CREATEMUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_CREATEMUTE_EXTENDED'),
			permissionLevel: 6,
			requiredGuildPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		await message.sendLocale('SYSTEM_LOADING');
		await message.guild!.security.actions.muteSetup();
		return message.sendLocale('COMMAND_SUCCESS');
	}

}
