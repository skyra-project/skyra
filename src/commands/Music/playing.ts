import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireMusicPlaying } from '@utils/Music/Decorators';
import { IMAGE_EXTENSION } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['np', 'nowplaying'],
	description: (language) => language.get('commandPlayingDescription'),
	requiredPermissions: ['EMBED_LINKS']
})
export default class extends MusicCommand {
	private kYoutubeUrlRegex = /(youtu\.be|youtube)/i;

	@requireMusicPlaying()
	public async run(message: KlasaMessage) {
		const queue = message.guild!.music;
		const song = queue.song || (queue.queue.length ? queue.queue[0] : null);
		if (!song) throw message.language.get('commandPlayingQueueEmpty');
		if (!queue.playing) throw message.language.get('commandPlayingQueueNotPlaying');

		const embed = new MessageEmbed()
			.setColor(12916736)
			.setTitle(song.title)
			.setURL(song.url)
			.setAuthor(song.author)
			.setDescription(message.language.get('commandPlayingDuration', { duration: song.friendlyDuration }))
			.setTimestamp();

		const imageUrl = this.getSongImage(song.url, song.identifier);
		if (imageUrl && IMAGE_EXTENSION.test(imageUrl)) embed.setThumbnail(imageUrl);

		return message.sendEmbed(embed);
	}

	private getSongImage(songUrl: string, songIdentifier: string) {
		if (this.kYoutubeUrlRegex.test(songUrl)) {
			return `https://i3.ytimg.com/vi/${songIdentifier}/hqdefault.jpg`;
		}

		return null;
	}
}
