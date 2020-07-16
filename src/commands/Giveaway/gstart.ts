import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { cleanMentions } from '@utils/util';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

const YEAR = 1000 * 60 * 60 * 24 * 365;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['giveaway'],
			description: language => language.tget('COMMAND_GIVEAWAY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_GIVEAWAY_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '[channel:textchannelname{2}] <time:time> <title:...string{,256}>',
			flagSupport: true,
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [channel = message.channel as TextChannel, time, title]: [TextChannel, Date, string]) {
		const offset = time.getTime() - Date.now();

		if (offset < 9500) throw message.language.tget('GIVEAWAY_TIME');
		if (offset > YEAR) throw message.language.tget('GIVEAWAY_TIME_TOO_LONG');

		const winners = Number(message.flagArgs.winners) ? parseInt(message.flagArgs.winners, 10) : 1;
		await this.client.giveaways.create({
			channelID: channel.id,
			endsAt: new Date(time.getTime() + 500),
			guildID: message.guild!.id,
			minimum: 1,
			minimumWinners: winners,
			title: cleanMentions(message.guild!, title)
		});
	}

}
