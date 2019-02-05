import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['giveaway'],
			description: (language) => language.get('COMMAND_GIVEAWAY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_GIVEAWAY_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
			runIn: ['text'],
			usage: '<time:time> <title:...string{,256}>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [time, title]: [Date, string]) {
		const offset = time.getTime() - Date.now();

		if (offset < 9500) throw message.language.get('GIVEAWAY_TIME');
		const giveaway = await this.client.giveaways.create({
			channelID: message.channel.id,
			endsAt: time.getTime() + 500,
			guildID: message.guild.id,
			minimum: 1,
			minimumWinners: 1,
			title
		});

		await message.author.send(message.language.get('GIVEAWAY_START_DIRECT_MESSAGE', title, giveaway.id)).catch(() => null);
	}

}
