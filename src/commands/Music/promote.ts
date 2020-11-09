import { MusicCommand } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import {
	requireDj,
	requireQueueNotEmpty,
	requireSameVoiceChannel,
	requireSkyraInVoiceChannel,
	requireUserInVoiceChannel
} from '@utils/Music/Decorators';

@ApplyOptions<MusicCommand.Options>({
	description: (language) => language.get(LanguageKeys.Commands.Music.PromoteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.PromoteExtended),
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireDj()
	@requireQueueNotEmpty()
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	public async run(message: GuildMessage, [index]: [number]) {
		// Minus one as user input is 1-based while the code is 0-based:
		--index;

		const language = await message.fetchLanguage();
		if (index < 0) throw language.get(LanguageKeys.Commands.Music.RemoveIndexInvalid);

		const { audio } = message.guild;
		const length = await audio.count();
		if (index >= length) {
			throw language.get(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: language.get(
					length === 1 ? LanguageKeys.Commands.Music.AddPlaylistSongs : LanguageKeys.Commands.Music.AddPlaylistSongsPlural,
					{
						count: length
					}
				)
			});
		}

		const entry = await audio.getAt(index);
		const track = await audio.player.node.decode(entry!.track);

		await audio.moveTracks(index, 0);
		await message.channel.send(language.get(LanguageKeys.Commands.Music.PromoteSuccess, { title: track.title, url: track.uri }));
	}
}
