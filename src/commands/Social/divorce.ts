import { Command } from '../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			runIn: ['text'],
			requiredPermissions: ['ADD_REACTIONS'],
			description: (language) => language.get('COMMAND_DIVORCE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DIVORCE_EXTENDED')
		});
	}

	public async run(msg) {
		if (!msg.author.settings.marry) return msg.sendLocale('COMMAND_DIVORCE_NOTTAKEN');

		// Ask the user if they're sure
		const accept = await msg.ask(msg.language.get('COMMAND_DIVORCE_PROMPT'));
		if (!accept) return msg.sendLocale('COMMAND_DIVORCE_CANCEL');

		// Fetch the user and sync the settings
		const user = await this.client.users.fetch(msg.author.settings.marry);
		await user.settings.sync();

		// Reset the values for both entries
		await Promise.all([
			msg.author.settings.reset('marry'),
			user.settings.reset('marry')
		]);

		// Tell the user about the divorce
		user.send(msg.language.get('COMMAND_DIVORCE_DM', msg.author.username)).catch(() => null);

		return msg.sendLocale('COMMAND_DIVORCE_SUCCESS', [user]);
	}

}
