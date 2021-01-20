import { requireDj, requireQueueNotEmpty, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.PromoteDescription,
	extendedHelp: LanguageKeys.Commands.Music.PromoteExtended,
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

		const t = await message.fetchT();
		if (index < 0) throw t(LanguageKeys.Commands.Music.RemoveIndexInvalid);

		const { audio } = message.guild;
		const length = await audio.count();
		if (index >= length) {
			throw t(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: t(LanguageKeys.Commands.Music.AddPlaylistSongs, { count: length })
			});
		}

		const entry = await audio.getAt(index);
		const track = await audio.player.node.decode(entry!.track);

		await audio.moveTracks(index, 0);
		await message.channel.send(t(LanguageKeys.Commands.Music.PromoteSuccess, { title: track.title, url: track.uri }));
	}
}
