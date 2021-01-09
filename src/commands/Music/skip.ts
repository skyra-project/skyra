import { Queue } from '#lib/audio';
import { MusicCommand } from '#lib/structures/MusicCommand';
import { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { requireSameVoiceChannel, requireSongPresent } from '#utils/Music/Decorators';
import { ApplyOptions } from '@skyra/decorators';
import { VoiceChannel } from 'discord.js';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.SkipDescription,
	extendedHelp: LanguageKeys.Commands.Music.SkipExtended,
	usage: '[force]'
})
export default class extends MusicCommand {
	@requireSongPresent()
	@requireSameVoiceChannel()
	public async run(message: GuildMessage, [force = false]: [boolean]) {
		const { audio } = message.guild;
		const { voiceChannel } = audio;

		const listeners = voiceChannel?.listeners.length ?? 0;
		if (listeners >= 4) {
			const response = force ? await this.canSkipWithForce(message, voiceChannel!) : await this.canSkipWithoutForce(message, audio, listeners);
			if (response !== null) return message.send(response);
		}

		const track = await audio.getCurrentTrack();
		await audio.next({ skipped: true });
		this.client.emit(Events.MusicSongSkipNotify, message, track);
		return null;
	}

	private async canSkipWithForce(message: GuildMessage, voiceChannel: VoiceChannel): Promise<string | null> {
		return (await message.member.canManage(voiceChannel)) ? null : message.resolveKey(LanguageKeys.Commands.Music.SkipPermissions);
	}

	private async canSkipWithoutForce(message: GuildMessage, audio: Queue, listeners: number): Promise<string | null> {
		const added = await audio.addSkipVote(message.author.id);
		if (!added) return message.resolveKey(LanguageKeys.Commands.Music.SkipVotesVoted);

		const amount = await audio.countSkipVotes();
		if (amount <= 3) return null;

		const needed = Math.ceil(listeners * 0.4);
		if (needed <= amount) return null;

		return message.resolveKey(LanguageKeys.Commands.Music.SkipVotesTotal, { amount, needed });
	}
}
