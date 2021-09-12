import { AudioCommand, Queue, RequireSameVoiceChannel, RequireSongPresent } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { canManage, getAudio, getListenerCount } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { resolveKey } from '@sapphire/plugin-i18next';
import type { VoiceChannel } from 'discord.js';
import type { TFunction } from 'i18next';

const flags = ['force'];

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.SkipDescription,
	detailedDescription: LanguageKeys.Commands.Music.SkipExtended,
	flags
})
export class UserAudioCommand extends AudioCommand {
	@RequireSongPresent()
	@RequireSameVoiceChannel()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const audio = getAudio(message.guild);
		const { voiceChannel } = audio;

		const listeners = getListenerCount(voiceChannel);
		const arg = args.nextMaybe();
		const shouldForce = arg.exists ? flags.includes(arg.value.toLowerCase()) : args.getFlags(...flags);
		if (listeners >= 4) {
			const response = shouldForce
				? await this.canSkipWithForce(message, voiceChannel!)
				: await this.canSkipWithoutForce(message, args.t, audio, listeners);

			if (response !== null) return send(message, response);
		}

		const track = await audio.getCurrentTrack();
		await audio.next({ skipped: true });
		this.container.client.emit(Events.MusicSongSkipNotify, message, track);
		return null;
	}

	private async canSkipWithForce(message: GuildMessage, voiceChannel: VoiceChannel): Promise<string | null> {
		return (await canManage(message.member, voiceChannel)) ? null : resolveKey(message, LanguageKeys.Commands.Music.SkipPermissions);
	}

	private async canSkipWithoutForce(message: GuildMessage, t: TFunction, audio: Queue, listeners: number): Promise<string | null> {
		const added = await audio.addSkipVote(message.author.id);
		if (!added) return t(LanguageKeys.Commands.Music.SkipVotesVoted);

		const amount = await audio.countSkipVotes();
		if (amount <= 3) return null;

		const needed = Math.ceil(listeners * 0.4);
		if (needed <= amount) return null;

		return t(LanguageKeys.Commands.Music.SkipVotesTotal, { amount, needed });
	}
}
