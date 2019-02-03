import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_BACKUP_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_BACKUP_EXTENDED'),
			guarded: true,
			permissionLevel: 10
		});
	}

	public async run(message: KlasaMessage) {
		// Disable this command so it cannot
		// run twice during a backup
		this.disable();
		const response = await message.sendMessage('Initializing backup... Please hold on.') as KlasaMessage;
		const task = this.client.tasks.get('backup');

		// Do NOT run the task if it's disabled
		if (task.enabled) {
			await task.run({});
			await response.edit('Successfully backed up all data.');
		}
		this.enable();

		// Delete the message sent later and return it
		// tslint:disable-next-line:no-floating-promises
		response.nuke(10000);
		return response;
	}

}
