import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['togglemdm', 'togglemoddm', 'tmdm'],
			cooldown: 10,
			description: language => language.tget('COMMAND_TOGGLEMODERATIONDM_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TOGGLEMODERATIONDM_EXTENDED')
		});
	}

	public async run(message: KlasaMessage) {
		await message.author.settings.sync();
		const current = message.author.settings.get(UserSettings.ModerationDM);
		await message.author.settings.update(UserSettings.ModerationDM, !current);
		return message.sendLocale('COMMAND_TOGGLEMODERATIONDM_TOGGLED', [!current]);
	}

}
