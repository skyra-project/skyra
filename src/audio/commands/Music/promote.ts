import {
	AudioCommand,
	RequireDj,
	RequireQueueNotEmpty,
	RequireSameVoiceChannel,
	RequireSkyraInVoiceChannel,
	RequireUserInVoiceChannel
} from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.PromoteDescription,
	extendedHelp: LanguageKeys.Commands.Music.PromoteExtended
})
export class UserMusicCommand extends AudioCommand {
	@RequireDj()
	@RequireQueueNotEmpty()
	@RequireUserInVoiceChannel()
	@RequireSkyraInVoiceChannel()
	@RequireSameVoiceChannel()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		let index = await args.pick('integer', { minimum: 1 });

		// Minus one as user input is 1-based while the code is 0-based:
		--index;

		const { audio } = message.guild;
		const length = await audio.count();
		if (index >= length) {
			this.error(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: args.t(LanguageKeys.Commands.Music.AddPlaylistSongs, { count: length })
			});
		}

		const entry = await audio.getAt(index);
		const track = await audio.player.node.decode(entry!.track);

		await audio.moveTracks(index, 0);
		await message.send(args.t(LanguageKeys.Commands.Music.PromoteSuccess, { title: track.title, url: track.uri }));
	}
}
