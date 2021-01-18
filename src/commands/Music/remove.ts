import { requireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures/commands/MusicCommand';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.RemoveDescription,
	extendedHelp: LanguageKeys.Commands.Music.RemoveExtended,
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	public async run(message: GuildMessage, [index]: [number]) {
		const t = await message.fetchT();

		// Minus one as user input is 1-based while the code is 0-based:
		--index;

		if (index < 0) throw t(LanguageKeys.Commands.Music.RemoveIndexInvalid);

		const { audio } = message.guild;
		const count = await audio.count();
		if (index >= count) {
			throw t(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: t(LanguageKeys.Commands.Music.AddPlaylistSongs, {
					count
				})
			});
		}

		// Retrieve information about the song to be removed.
		const entry = await audio.getAt(index);

		// Remove the song from the queue.
		await audio.removeAt(index);
		this.context.client.emit(Events.MusicRemoveNotify, message, entry);
	}
}
