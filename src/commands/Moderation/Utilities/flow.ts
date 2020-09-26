import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 15,
			description: 'Check the messages/minute from a channel.',
			permissionLevel: PermissionLevels.Moderator,
			runIn: ['text'],
			usage: '[channel:channelname]'
		});
	}

	public async run(message: KlasaMessage, [channel = message.channel as TextChannel]: [TextChannel?]) {
		if (!channel.readable) throw message.language.get(LanguageKeys.Misc.ChannelNotReadable);
		const messages = await channel.messages.fetch({ limit: 100, before: message.id });
		const minimum = message.createdTimestamp - 60000;
		const amount = messages.reduce((prev, curr) => (curr.createdTimestamp > minimum ? prev + 1 : prev), 0);

		return message.sendLocale(LanguageKeys.Commands.Moderation.Flow, [{ amount }]);
	}
}
