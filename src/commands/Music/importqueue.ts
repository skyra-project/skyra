import type { QueueEntry } from '#lib/audio';
import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures/commands/MusicCommand';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { empty, filter, map, take } from '#utils/iterator';
import { fetch, FetchResultTypes } from '#utils/util';
import type { Track } from '@skyra/audio';
import { ApplyOptions, CreateResolvers } from '@sapphire/decorators';
import { deserialize } from 'binarytf';
import { maximumExportQueueSize } from './exportqueue';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['iq'],
	cooldown: 30,
	description: LanguageKeys.Commands.Music.ImportQueueDescription,
	extendedHelp: LanguageKeys.Commands.Music.ImportQueueExtended,
	usage: '<queue:squeue>',
	flagSupport: true
})
@CreateResolvers([
	[
		'squeue',
		async (arg, possible, message) => {
			if (!arg && message.attachments.size === 0) throw await message.resolveKey(LanguageKeys.MusicManager.ImportQueueNotFound);
			return message.attachments.first()?.url ?? message.client.arguments.get('url')!.run(arg, possible, message);
		}
	]
])
export default class extends MusicCommand {
	public async run(message: GuildMessage, [url]: [string]) {
		const raw = await this.fetchRawData(message, url);

		const { audio } = message.guild;
		const decodedTracks = await audio.player.node.decode(raw);
		const tracks = [...(await this.process(message, 100, decodedTracks))];

		// Add the tracks
		const added = await audio.add(...tracks);
		if (added === 0) throw await message.resolveKey(LanguageKeys.MusicManager.TooManySongs);

		this.client.emit(Events.MusicAddNotify, message, tracks);
	}

	private async fetchRawData(message: GuildMessage, url: string) {
		try {
			const raw = await fetch(url, FetchResultTypes.Buffer);
			return deserialize<string[]>(raw);
		} catch {
			throw await message.resolveKey(LanguageKeys.MusicManager.ImportQueueError);
		}
	}

	private async process(message: GuildMessage, remainingUserEntries: number, tracks: Track[]) {
		if (remainingUserEntries === 0) return empty<QueueEntry>();

		const [maximumDuration, allowStreams] = await message.guild.readSettings([
			GuildSettings.Music.MaximumDuration,
			GuildSettings.Music.AllowStreams
		]);

		const filtered = filter(tracks.values(), (track) => (allowStreams ? true : track.info.isStream) && track.info.length <= maximumDuration);
		const taken = take(filtered, (await message.member.isDJ()) ? maximumExportQueueSize : remainingUserEntries);
		return map(taken, (track) => ({ author: message.author.id, track: track.track }));
	}
}
