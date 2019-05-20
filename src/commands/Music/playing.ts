import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['np', 'nowplaying'],
			description: language => language.get('COMMAND_PLAYING_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'VOICE_PLAYING']
		});
	}

	public async run(message: KlasaMessage) {
		const queue = message.guild.music;
		if (!queue.length) throw message.language.get('COMMAND_PLAYING_QUEUE_EMPTY');
		if (!queue.playing) throw message.language.get('COMMAND_PLAYING_QUEUE_NOT_PLAYING');

		const [song] = queue;
		return message.sendMessage(new MessageEmbed()
			.setColor(12916736)
			.setTitle(song.title)
			.setURL(song.url)
			.setAuthor(song.author)
			.setDescription(message.language.get('COMMAND_PLAYING_DURATION', song.friendlyDuration))
			.setTimestamp());
	}

}
