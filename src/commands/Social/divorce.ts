import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { User } from 'discord.js';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_DIVORCE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_DIVORCE_EXTENDED'),
			requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '<user:user>'
		});
	}

	public async run(message: KlasaMessage, [user]: [User]) {
		const marry = message.author.settings.get(UserSettings.Marry);
		if (!marry.includes(user.id)) return message.sendLocale('COMMAND_DIVORCE_NOTTAKEN');

		// Ask the user if they're sure
		const accept = await message.ask(message.language.tget('COMMAND_DIVORCE_PROMPT'));
		if (!accept) return message.sendLocale('COMMAND_DIVORCE_CANCEL');

		// Reset the values for both entries
		await Promise.all([
			message.author.settings.update(UserSettings.Marry, user, { arrayAction: 'remove' }),
			user.settings.update(UserSettings.Marry, message.author, { arrayAction: 'remove' })
		]);

		// Tell the user about the divorce
		user.send(message.language.tget('COMMAND_DIVORCE_DM', message.author.username)).catch(() => null);
		return message.sendLocale('COMMAND_DIVORCE_SUCCESS', [user]);
	}

}
