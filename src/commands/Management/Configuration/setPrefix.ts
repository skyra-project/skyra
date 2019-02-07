import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_SETPREFIX_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETPREFIX_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<prefix:string{1,10}>'
		});
	}

	public async run(message: KlasaMessage, [prefix]: [string]) {
		if (message.guild.settings.get(GuildSettings.Prefix) === prefix) throw message.language.get('CONFIGURATION_EQUALS');
		await message.guild.settings.update(GuildSettings.Prefix, prefix);
		return message.sendLocale('COMMAND_SETPREFIX_SET', [prefix]);
	}

}
