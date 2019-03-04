import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_CLEAR_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY']
		});
	}

	public async run(message: KlasaMessage) {
		const { music } = message.guild;

		if (music.listeners.length >= 4 && !await message.hasAtLeastPermissionLevel(5)) {
			throw message.language.get('COMMAND_CLEAR_DENIED');
		}

		const amount = music.length;
		music.prune();
		return message.sendLocale('COMMAND_CLEAR_SUCCESS', [amount]);
	}

}
