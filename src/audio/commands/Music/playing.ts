import { MusicCommand, requireMusicPlaying } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { IMAGE_EXTENSION, showSeconds } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { TrackInfo } from '@skyra/audio';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['np', 'nowplaying'],
	description: LanguageKeys.Commands.Music.PlayingDescription,
	extendedHelp: LanguageKeys.Commands.Music.PlayingExtended,
	permissions: ['EMBED_LINKS']
})
export class UserMusicCommand extends MusicCommand {
	private readonly kYoutubeUrlRegex = /(youtu\.be|youtube)/i;

	@requireMusicPlaying()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const { audio } = message.guild;

		const entry = await audio.getCurrentTrack();
		if (!entry) this.error(LanguageKeys.Commands.Music.PlayingQueueEmpty);

		const track = await audio.player.node.decode(entry.track);
		return message.send(this.getMessageEmbed(args.t, track));
	}

	private getMessageEmbed(t: TFunction, track: TrackInfo): MessageEmbed {
		const embed = new MessageEmbed()
			.setColor(12916736)
			.setTitle(track.title)
			.setURL(track.uri)
			.setAuthor(track.author)
			.setDescription(t(LanguageKeys.Commands.Music.PlayingDuration, { duration: showSeconds(track.length) }))
			.setTimestamp();

		const imageUrl = this.getSongImage(track.uri, track.identifier);
		if (imageUrl && IMAGE_EXTENSION.test(imageUrl)) embed.setThumbnail(imageUrl);

		return embed;
	}

	private getSongImage(songUrl: string, songIdentifier: string) {
		if (this.kYoutubeUrlRegex.test(songUrl)) {
			return `https://i3.ytimg.com/vi/${songIdentifier}/hqdefault.jpg`;
		}

		return null;
	}
}
