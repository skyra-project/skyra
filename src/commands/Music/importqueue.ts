import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import type { KlasaMessage } from 'klasa';
import type { TrackData } from 'lavacord';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['iq'],
	cooldown: 30,
	description: (language) => language.get('commandImportQueueDescription'),
	extendedHelp: (language) => language.get('commandImportQueueExtended'),
	usage: '(queue:url)',
	flagSupport: true
})
export default class extends MusicCommand {
	public async run(message: KlasaMessage, [url]: [string | undefined]) {
		const { music } = message.guild!;
		if (message.attachments.size === 0 && !url) throw message.language.get('musicManagerImportQueueNotFound');

		const queueUrl = message.attachments.size > 0 ? message.attachments.first()!.url : url!;
		const tracks = await music.parseQueue(queueUrl);
		message.guild!.music.add(
			message.author.id,
			this.filter(message, music.getRemainingUserEntries(message.author.id), tracks),
			this.getContext(message)
		);
	}

	private filter(message: KlasaMessage, remainingUserEntries: number, tracks: TrackData[]) {
		if (message.member!.isDJ) return tracks.slice(0, remainingUserEntries);

		const maximumDuration = message.guild!.settings.get(GuildSettings.Music.MaximumDuration);
		const allowStreams = message.guild!.settings.get(GuildSettings.Music.AllowStreams);

		return tracks
			.filter((track) => (allowStreams ? true : track.info.isStream) && track.info.length <= maximumDuration)
			.slice(0, remainingUserEntries);
	}
}
