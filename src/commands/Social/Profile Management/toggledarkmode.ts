import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { UserSettings } from '../../../lib/types/settings/UserSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['darkmode', 'toggledarktheme', 'darktheme'],
			cooldown: 5,
			description: language => language.tget('COMMAND_TOGGLEDARKMODE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TOGGLEDARKMODE_EXTENDED')
		});
	}

	public async run(message: KlasaMessage, []: []) {
		await message.author.settings.sync();
		const current = message.author.settings.get(UserSettings.DarkTheme);
		await message.author.settings.update(UserSettings.DarkTheme, !current);
		return message.sendLocale('COMMAND_TOGGLEDARKMODE_TOGGLED', [!current]);
	}

}
