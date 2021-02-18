import { MusicCommand, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['p'],
	description: LanguageKeys.Commands.Music.PlayDescription,
	extendedHelp: LanguageKeys.Commands.Music.PlayExtended,
	strategyOptions: { flags: ['import', 'sc', 'soundcloud'] }
})
export class UserMusicCommand extends MusicCommand {
	private get add(): MusicCommand {
		return this.store.get('add') as MusicCommand;
	}

	private get join(): MusicCommand {
		return this.store.get('join') as MusicCommand;
	}

	@requireUserInVoiceChannel()
	public async run(message: GuildMessage, args: MusicCommand.Args, context: MusicCommand.Context) {
		if (!args.finished) {
			// If there are songs or a queue, add them
			await this.add.run(message, args, context);
			if (message.guild.audio.playing) return;
		}

		// Retrieve the currently playing track, then check if there is at least one track to be played.
		const { audio } = message.guild;
		const current = await audio.getCurrentTrack();
		if (!current && (await audio.count()) === 0) {
			return message.send(args.t(LanguageKeys.Commands.Music.PlayQueueEmpty));
		}

		// If Skyra is not in a voice channel, join
		if (!audio.voiceChannelID) {
			await this.join.run(message, args, context);
		}

		// If Skyra is already playing, send a message.
		if (audio.playing) {
			return message.send(args.t(LanguageKeys.Commands.Music.PlayQueuePlaying));
		}

		if (current && audio.paused) {
			await audio.resume();
			const track = await audio.player.node.decode(current.track);
			await message.send(args.t(LanguageKeys.Commands.Music.PlayQueuePaused, { song: `<${track.uri}>` }));
		} else {
			await audio.setTextChannelID(message.channel.id);
			await audio.start();
		}

		return null;
	}
}
