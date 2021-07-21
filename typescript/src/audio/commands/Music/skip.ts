import { MusicCommand, Queue, requireSameVoiceChannel, requireSongPresent } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { canManage, getListenerCount } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import type { VoiceChannel } from 'discord.js';
import type { TFunction } from 'i18next';

const flags = ['force'];

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.SkipDescription,
	extendedHelp: LanguageKeys.Commands.Music.SkipExtended,
	strategyOptions: { flags }
})
export class UserMusicCommand extends MusicCommand {
	@requireSongPresent()
	@requireSameVoiceChannel()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const { audio } = message.guild;
		const { voiceChannel } = audio;

		const listeners = getListenerCount(voiceChannel);
		const arg = args.nextMaybe();
		const shouldForce = arg.exists ? flags.includes(arg.value.toLowerCase()) : args.getFlags(...flags);
		if (listeners >= 4) {
			const response = shouldForce
				? await this.canSkipWithForce(message, voiceChannel!)
				: await this.canSkipWithoutForce(message, args.t, audio, listeners);

			if (response !== null) return message.send(response);
		}

		const track = await audio.getCurrentTrack();
		await audio.next({ skipped: true });
		this.context.client.emit(Events.MusicSongSkipNotify, message, track);
		return null;
	}

	private async canSkipWithForce(message: GuildMessage, voiceChannel: VoiceChannel): Promise<string | null> {
		return (await canManage(message.member, voiceChannel)) ? null : message.resolveKey(LanguageKeys.Commands.Music.SkipPermissions);
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
