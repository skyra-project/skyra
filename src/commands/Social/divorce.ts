import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_DIVORCE_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_DIVORCE_EXTENDED'),
			requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		const marry = message.author!.settings.get(UserSettings.Marry);
		if (!marry) return message.sendLocale('COMMAND_DIVORCE_NOTTAKEN');

		// Ask the user if they're sure
		const accept = await message.ask(message.language.get('COMMAND_DIVORCE_PROMPT'));
		if (!accept) return message.sendLocale('COMMAND_DIVORCE_CANCEL');

		// Fetch the user and sync the settings
		const user = await this.client.users.fetch(marry);
		await user.settings.sync();

		// Reset the values for both entries
		await Promise.all([
			message.author!.settings.reset(UserSettings.Marry),
			user.settings.reset(UserSettings.Marry)
		]);

		// Tell the user about the divorce
		user.send(message.language.get('COMMAND_DIVORCE_DM', message.author!.username)).catch(() => null);

		return message.sendLocale('COMMAND_DIVORCE_SUCCESS', [user]);
	}

}
