import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { fetch, FetchResultTypes } from '@utils/util';
import { KlasaMessage, Possible } from 'klasa';
import { TrackData } from 'lavacord';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['iq'],
	cooldown: 30,
	// description: (language) => language.get('COMMAND_ADD_DESCRIPTION'),
	// extendedHelp: (language) => language.get('COMMAND_ADD_EXTENDED'),
	usage: '[queue:url]',
	flagSupport: true
})
export default class extends MusicCommand {
	public async run(message: KlasaMessage, [url]: [string | undefined]) {
		//
		if (message.attachments.size === 0 && !url) throw `I need a queue to import to the decks!`;

		const queueUrl = message.attachments.size > 0 ? message.attachments.first()!.url : url!;
		let data = undefined;
		try {
			const rawData = await fetch<string[]>(queueUrl, FetchResultTypes.JSON);

			const fakePossible = new Possible(['', '', '', '', '', '', '']);
			data = (await Promise.all(
				rawData.map((link) => this.client.arguments.get('song')!.run(link, fakePossible, message) as TrackData | TrackData[])
			)) as (TrackData | TrackData[])[];

			message.guild!.music.add(message.author.id, data!.flat(), this.getContext(message));
		} catch {
			throw `Sorry, but I'm having issues trying to import that playlist. Are you sure it's from my own DJ deck?`;
		}
	}
}
