import { MusicCommand } from '@lib/structures/MusicCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_LEAVE_DESCRIPTION'),
			music: ['SKYRA_VOICE_CHANNEL', 'DJ_MEMBER', 'SAME_VOICE_CHANNEL']
		});
	}

	public async run(message: KlasaMessage) {
		await message.guild!.music.leave(this.getContext(message));
	}

}
