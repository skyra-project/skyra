import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

const YEAR = 1000 * 60 * 60 * 24 * 365;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['giveaway'],
			description: language => language.tget('COMMAND_GIVEAWAY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_GIVEAWAY_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '<time:time> <title:...string{,256}>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [time, title]: [Date, string]) {
		const offset = time.getTime() - Date.now();

		if (offset < 9500) throw message.language.tget('GIVEAWAY_TIME');
		if (offset > YEAR) throw message.language.tget('GIVEAWAY_TIME_TOO_LONG');
		await this.client.giveaways.create({
			channelID: message.channel.id,
			endsAt: time.getTime() + 500,
			guildID: message.guild!.id,
			minimum: 1,
			minimumWinners: 1,
			title
		});
	}

}
