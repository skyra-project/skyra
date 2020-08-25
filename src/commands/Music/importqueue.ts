import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import type { KlasaMessage } from 'klasa';
import type { TrackData } from 'lavacord';
import { maximumExportQueueSize } from './exportqueue';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['iq'],
	cooldown: 30,
	description: (language) => language.get('commandImportQueueDescription'),
	extendedHelp: (language) => language.get('commandImportQueueExtended'),
	usage: '<queue:squeue>',
	flagSupport: true
})
@CreateResolvers([
	[
		'squeue',
		(arg, possible, message) => {
			if (!arg && message.attachments.size === 0) throw message.language.get('musicManagerImportQueueNotFound');
			return message.attachments.first()?.url ?? message.client.arguments.get('url')!.run(arg, possible, message);
		}
	]
])
export default class extends MusicCommand {
	public async run(message: KlasaMessage, [url]: [string]) {
		const { music } = message.guild!;

		const tracks = await music.parseQueue(url);
		message.guild!.music.add(
			message.author.id,
			this.filter(message, music.getRemainingUserEntries(message.author.id), tracks),
			this.getContext(message)
		);
	}

	private filter(message: KlasaMessage, remainingUserEntries: number, tracks: TrackData[]) {
		const maximumDuration = message.guild!.settings.get(GuildSettings.Music.MaximumDuration);
		const allowStreams = message.guild!.settings.get(GuildSettings.Music.AllowStreams);

		return tracks
			.filter((track) => (allowStreams ? true : track.info.isStream) && track.info.length <= maximumDuration)
			.slice(0, message.member!.isDJ ? maximumExportQueueSize : remainingUserEntries);
	}
}
