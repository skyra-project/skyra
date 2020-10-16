import { QueueEntry } from '@lib/audio';
import { empty, filter, map, take } from '@lib/misc';
import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Track } from '@skyra/audio';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { fetch, FetchResultTypes } from '@utils/util';
import { deserialize } from 'binarytf';
import type { KlasaMessage } from 'klasa';
import { maximumExportQueueSize } from './exportqueue';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['iq'],
	cooldown: 30,
	description: (language) => language.get(LanguageKeys.Commands.Music.ImportQueueDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.ImportQueueExtended),
	usage: '<queue:squeue>',
	flagSupport: true
})
@CreateResolvers([
	[
		'squeue',
		(arg, possible, message) => {
			if (!arg && message.attachments.size === 0) throw message.language.get(LanguageKeys.MusicManager.ImportQueueNotFound);
			return message.attachments.first()?.url ?? message.client.arguments.get('url')!.run(arg, possible, message);
		}
	]
])
export default class extends MusicCommand {
	public async run(message: KlasaMessage, [url]: [string]) {
		const raw = await this.fetchRawData(message, url);

		const { audio } = message.guild!;
		const tracks = await audio.player.node.decode(raw);
		const added = await audio.add(...this.process(message, 100, tracks));
		if (added === 0) throw message.language.get(LanguageKeys.MusicManager.TooManySongs);

		// TODO(kyranet): add message reply.
	}

	private async fetchRawData(message: KlasaMessage, url: string) {
		try {
			const raw = await fetch(url, FetchResultTypes.Buffer);
			return deserialize<string[]>(raw);
		} catch {
			throw message.language.get(LanguageKeys.MusicManager.ImportQueueError);
		}
	}

	private process(message: KlasaMessage, remainingUserEntries: number, tracks: Track[]) {
		if (remainingUserEntries === 0) return empty<QueueEntry>();

		const maximumDuration = message.guild!.settings.get(GuildSettings.Music.MaximumDuration);
		const allowStreams = message.guild!.settings.get(GuildSettings.Music.AllowStreams);

		const filtered = filter(tracks.values(), (track) => (allowStreams ? true : track.info.isStream) && track.info.length <= maximumDuration);
		const taken = take(filtered, message.member!.isDJ ? maximumExportQueueSize : remainingUserEntries);
		return map(taken, (track) => ({ author: message.author.id, track: track.track }));
	}
}
