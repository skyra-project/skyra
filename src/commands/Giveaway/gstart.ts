import { MessageEmbed } from 'discord.js';
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

		// A little margin of error
		if (offset < 59900) throw message.language.get('GIVEAWAY_TIME');
		const date = new Date(offset + Date.now() - 20000);

		let remoteMessage;
		try {
			remoteMessage = await message.channel.send(message.language.get('GIVEAWAY_TITLE'), {
				embed: new MessageEmbed()
					.setColor(0x49C6F7)
					.setTitle(title)
					.setDescription(message.language.get('GIVEAWAY_DURATION', offset))
					.setFooter(message.language.get('GIVEAWAY_ENDS_AT'))
					.setTimestamp(date)
			});
			await remoteMessage.react('🎉');
		} catch (_) {
			return null;
		}

		const { id } = await this.client.schedule.create('giveaway', date, {
			catchUp: true,
			data: {
				channelID: message.channel.id,
				guildID: message.guild.id,
				messageID: remoteMessage.id,
				timestamp: date.getTime() + 20000,
				title,
				userID: message.author.id
			}
		});

		await message.author.send(message.language.get('GIVEAWAY_START_DIRECT_MESSAGE', title, id)).catch(() => null);
		return remoteMessage;
	}

}
