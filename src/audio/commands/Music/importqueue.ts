import { MusicCommand, QueueEntry } from '#lib/audio';
import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { empty, filter, map, take } from '#utils/common';
import { isDJ } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import type { Track } from '@skyra/audio';
import { deserialize } from 'binarytf';
import { maximumExportQueueSize } from './exportqueue';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['iq'],
	cooldown: 30,
	description: LanguageKeys.Commands.Music.ImportQueueDescription,
	extendedHelp: LanguageKeys.Commands.Music.ImportQueueExtended
})
export class UserMusicCommand extends MusicCommand {
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const url = message.attachments.first()?.url ?? (await args.pick('hyperlink')).href;
		const raw = await this.fetchRawData(url);

		const { audio } = message.guild;
		const decodedTracks = await audio.player.node.decode(raw);
		const tracks = [...(await this.process(message, 100, decodedTracks))];

		// Add the tracks
		const added = await audio.add(...tracks);
		if (added === 0) this.error(LanguageKeys.MusicManager.TooManySongs);

		this.context.client.emit(Events.MusicAddNotify, message, tracks);
	}

	private async fetchRawData(url: string) {
		try {
			const raw = await fetch(url, FetchResultTypes.Buffer);
			return deserialize<string[]>(raw);
		} catch {
			this.error(LanguageKeys.MusicManager.ImportQueueError);
		}
	}

	private async process(message: GuildMessage, remainingUserEntries: number, tracks: Track[]) {
		if (remainingUserEntries === 0) return empty<QueueEntry>();

		const [maximumDuration, allowStreams] = await readSettings(message.guild, [
			GuildSettings.Music.MaximumDuration,
			GuildSettings.Music.AllowStreams
		]);

		const filtered = filter(tracks.values(), (track) => (allowStreams ? true : track.info.isStream) && track.info.length <= maximumDuration);
		const taken = take(filtered, (await isDJ(message.member)) ? maximumExportQueueSize : remainingUserEntries);
		return map(taken, (track) => ({ author: message.author.id, track: track.track }));
	}
}
