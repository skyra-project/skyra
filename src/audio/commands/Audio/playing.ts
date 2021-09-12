import { AudioCommand, RequireMusicPlaying } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { getAudio } from '#utils/functions';
import { IMAGE_EXTENSION, showSeconds } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { TrackInfo } from '@skyra/audio';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<AudioCommand.Options>({
	aliases: ['np', 'nowplaying'],
	description: LanguageKeys.Commands.Music.PlayingDescription,
	extendedHelp: LanguageKeys.Commands.Music.PlayingExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserAudioCommand extends AudioCommand {
	private readonly kYoutubeUrlRegex = /(youtu\.be|youtube)/i;

	@RequireMusicPlaying()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const audio = getAudio(message.guild);

		const entry = await audio.getCurrentTrack();
		if (!entry) this.error(LanguageKeys.Commands.Music.PlayingQueueEmpty);

		const track = await audio.player.node.decode(entry.track);
		const embed = this.getMessageEmbed(args.t, track);
		return send(message, { embeds: [embed] });
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
