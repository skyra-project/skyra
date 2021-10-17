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
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.PromoteDescription,
	detailedDescription: LanguageKeys.Commands.Music.PromoteExtended
})
export class UserAudioCommand extends AudioCommand {
	@RequireDj()
	@RequireQueueNotEmpty()
	@RequireUserInVoiceChannel()
	@RequireSkyraInVoiceChannel()
	@RequireSameVoiceChannel()
	public async messageRun(message: GuildMessage, args: AudioCommand.Args) {
		let index = await args.pick('integer', { minimum: 1 });

		// Minus one as user input is 1-based while the code is 0-based:
		--index;

		const audio = getAudio(message.guild);
		const length = await audio.count();
		if (index >= length) {
			this.error(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: args.t(LanguageKeys.Commands.Music.AddPlaylistSongs, { count: length })
			});
		}

		const entry = await audio.getAt(index);
		const track = await audio.player.node.decode(entry!.track);

		await audio.moveTracks(index, 0);

		const content = args.t(LanguageKeys.Commands.Music.PromoteSuccess, { title: track.title, url: track.uri });
		await send(message, content);
	}
}
