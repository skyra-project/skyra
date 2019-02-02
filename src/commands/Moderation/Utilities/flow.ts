import { TextChannel } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 15,
			description: 'Check the messages/minute from a channel.',
			permissionLevel: 4,
			runIn: ['text'],
			usage: '[channel:channelname]'
		});
	}

	public async run(message: KlasaMessage, [channel = message.channel as TextChannel]: [TextChannel?]) {
		if (!channel.readable) throw message.language.get('CHANNEL_NOT_READABLE');
		const messages = await channel.messages.fetch({ limit: 100, before: message.id }),
			minimum = message.createdTimestamp - 60000,
			amount = messages.reduce((prev, curr) => curr.createdTimestamp > minimum ? prev + 1 : prev, 0);

		return message.sendLocale('COMMAND_FLOW', [amount]);
	}

}
