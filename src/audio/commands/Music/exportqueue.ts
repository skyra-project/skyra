import { AudioCommand, QueueEntry, RequireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { map, prependIfNotNull, take } from '#utils/common';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@skyra/editable-commands';
import { serialize } from 'binarytf';

export const maximumExportQueueSize = 100;

@ApplyOptions<AudioCommand.Options>({
	aliases: ['eq'],
	cooldownLimit: 10,
	description: LanguageKeys.Commands.Music.ExportQueueDescription,
	extendedHelp: LanguageKeys.Commands.Music.ExportQueueExtended,
	requiredClientPermissions: ['ATTACH_FILES'],
	runIn: ['GUILD_ANY']
})
export class UserCommand extends AudioCommand {
	@RequireQueueNotEmpty()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const audio = getAudio(message.guild);
		const head = await audio.getCurrentTrack().then((v) => this.serializeCurrent(v));
		const data = await audio.tracks().then((tracks) => this.serializeQueue(tracks, head));

		const { name } = message.guild;
		const content = args.t(LanguageKeys.Commands.Music.ExportQueueSuccess, { guildName: name });
		return send(message, { content, files: [{ attachment: Buffer.from(data), name: `${name}-${Date.now()}.squeue` }] });
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
