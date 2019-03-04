import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_LEAVE_DESCRIPTION'),
			music: ['SKYRA_VOICE_CHANNEL', 'DJ_MEMBER', 'SAME_VOICE_CHANNEL']
		});
	}

	public async run(message: KlasaMessage) {
		const voiceChannel = message.guild.music.voiceChannel;
		await message.guild.music.leave();
		return message.sendLocale('COMMAND_LEAVE_SUCCESS', [voiceChannel]);
	}

}
