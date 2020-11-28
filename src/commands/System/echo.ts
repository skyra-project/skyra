import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { MessageOptions, TextChannel } from 'discord.js';
import { CommandStore } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['talk'],
			description: (language) => language.get(LanguageKeys.Commands.System.EchoDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.System.EchoExtended),
			guarded: true,
			permissionLevel: PermissionLevels.BotOwner,
			runIn: ['text'],
			usage: '[channel:channel] [message:...string]',
			usageDelim: ' '
		});
	}

	public async run(message: GuildMessage, [channel = message.channel as TextChannel, content]: [TextChannel, string]) {
		if (message.deletable) message.nuke().catch(() => null);

		const attachment = message.attachments.size ? message.attachments.first()!.url : null;

		if (!content.length && !attachment) {
			throw 'I have no content nor attachment to send, please write something.';
		}

		const options: MessageOptions = {};
		if (attachment) options.files = [{ attachment }];

		await channel.send(content, options);
		if (channel !== message.channel) await message.alert(`Message successfully sent to ${channel}`);

		return message;
	}
}
