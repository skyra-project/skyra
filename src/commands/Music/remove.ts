import { requireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.RemoveDescription,
	extendedHelp: LanguageKeys.Commands.Music.RemoveExtended
})
export class UserMusicCommand extends MusicCommand {
	@requireQueueNotEmpty()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		let index = await args.pick('integer', { minimum: 1 });

		// Minus one as user input is 1-based while the code is 0-based:
		--index;

		const { audio } = message.guild;
		const count = await audio.count();
		if (index >= count) {
			throw args.t(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: args.t(LanguageKeys.Commands.Music.AddPlaylistSongs, { count })
			});
		}

		// Retrieve information about the song to be removed.
		const entry = await audio.getAt(index);

		// Remove the song from the queue.
		await audio.removeAt(index);
		this.context.client.emit(Events.MusicRemoveNotify, message, entry);
	}
}
