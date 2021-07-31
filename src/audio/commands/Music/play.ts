import { AudioCommand, RequireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@skyra/editable-commands';

@ApplyOptions<AudioCommand.Options>({
	aliases: ['p'],
	description: LanguageKeys.Commands.Music.PlayDescription,
	extendedHelp: LanguageKeys.Commands.Music.PlayExtended,
	flags: ['import', 'sc', 'soundcloud']
})
export class UserMusicCommand extends AudioCommand {
	private get add(): AudioCommand {
		return this.store.get('add') as AudioCommand;
	}

	private get join(): AudioCommand {
		return this.store.get('join') as AudioCommand;
	}

	@RequireUserInVoiceChannel()
	public async run(message: GuildMessage, args: AudioCommand.Args, context: AudioCommand.Context) {
		const audio = getAudio(message.guild);

		// If Skyra is not in a voice channel, join
		if (!audio.voiceChannelId) {
			await this.join.run(message, args, context);
		}

		if (!args.finished) {
			// If there are songs or a queue, add them
			await this.add.run(message, args, context);
			if (audio.playing) return;
		}

		// Retrieve the currently playing track, then check if there is at least one track to be played.
		const current = await audio.getCurrentTrack();
		if (!current && (await audio.count()) === 0) {
			const content = args.t(LanguageKeys.Commands.Music.PlayQueueEmpty);
			return send(message, content);
		}

		// If Skyra is already playing, send a message.
		if (audio.playing) {
			const content = args.t(LanguageKeys.Commands.Music.PlayQueuePlaying);
			return send(message, content);
		}

		if (current && audio.paused) {
			await audio.resume();
			const track = await audio.player.node.decode(current.track);
			const content = args.t(LanguageKeys.Commands.Music.PlayQueuePaused, { song: `<${track.uri}>` });
			await send(message, content);
		} else {
			await audio.setTextChannelId(message.channel.id);
			await audio.start();
		}

		return null;
	}
}
