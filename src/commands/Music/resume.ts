import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_RESUME_DESCRIPTION'),
			music: ['VOICE_PAUSED', 'SAME_VOICE_CHANNEL']
		});
	}

	public async run(message: KlasaMessage) {
		await message.guild.music.resume();
		return message.sendLocale('COMMAND_RESUME_SUCCESS');
	}

}
