import { QueueEntry } from '@lib/audio';
import { map, prependIfNotNull, take } from '@lib/misc';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';
import { serialize } from 'binarytf';

export const maximumExportQueueSize = 100;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['eq'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Music.ExportQueueDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.ExportQueueExtended),
	requiredGuildPermissions: ['ATTACH_FILES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	@requireQueueNotEmpty()
	public async run(message: GuildMessage) {
		const { audio, name } = message.guild;
		const head = await audio.getCurrentTrack().then((v) => this.serializeCurrent(v));
		const data = await audio.tracks().then((tracks) => this.serializeQueue(tracks, head));

		return message.channel.sendFile(
			Buffer.from(data),
			`${name}-${Date.now()}.squeue`,
			await message.fetchLocale(LanguageKeys.Commands.Music.ExportQueueSuccess, { guildName: name })
		);
	}

	private serializeCurrent(entry: QueueEntry | null): string | null {
		return entry?.track ?? null;
	}

	private serializeQueue(tracks: QueueEntry[], head: string | null) {
		const sliced = take(tracks.values(), maximumExportQueueSize - (head ? 1 : 0));
		const mapped = map(sliced, (value) => value.track);
		return serialize([...prependIfNotNull(mapped, head)]);
	}
}
