import { CommandStore, KlasaMessage } from 'klasa';
import { Track } from 'lavalink';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_PLAY_DESCRIPTION'),
			music: ['USER_VOICE_CHANNEL'],
			usage: '(song:song)',
			flagSupport: true
		});

		this.createCustomResolver('song', (arg, possible, message) => arg ? this.client.arguments.get('song')!.run(arg, possible, message) : null);
	}

	public async run(message: KlasaMessage, [songs]: [Track | Track[]]) {
		const { music } = message.guild!;

		if (songs) {
			// If there are songs, add them
			await this.client.commands.get('add')!.run(message, [songs]);
			if (music.playing) return;
		} else if (!music.canPlay) {
			await message.sendLocale('COMMAND_QUEUE_EMPTY');
			return;
		}

		// If Skyra is not in a voice channel, join
		if (!music.voiceChannel) {
			await this.client.commands.get('join')!.run(message, []);
		}

		if (music.playing) {
			await message.sendLocale('COMMAND_PLAY_QUEUE_PLAYING');
		} else if (music.paused) {
			await music.resume(this.getContext(message));
			await message.sendLocale('COMMAND_PLAY_QUEUE_PAUSED', [music.song]);
		} else {
			music.channelID = message.channel.id;
			await music.play(this.getContext(message));
		}
	}

}
