import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_SETPREFIX_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SETPREFIX_EXTENDED'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<prefix:string{1,10}>',
			aliases: ['prefix']
		});
	}

	public async run(message: KlasaMessage, [prefix]: [string]) {
		if (message.guild!.settings.get(GuildSettings.Prefix) === prefix) throw message.language.tget('CONFIGURATION_EQUALS');
		await message.guild!.settings.update(GuildSettings.Prefix, prefix, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_SETPREFIX_SET', [prefix]);
	}

}
