import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { Events } from '../../../lib/types/Enums';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_REBOOT_DESCRIPTION'),
			guarded: true,
			permissionLevel: 10
		});
	}

	public async run(message: KlasaMessage) {
		await message.sendLocale('COMMAND_REBOOT').catch(err => this.client.emit(Events.ApiError, err));

		try {
			this.client.destroy();
			await Promise.all(this.client.providers.map(provider => provider.shutdown()));
		} catch {}

		process.exit();
		return null;
	}

}
