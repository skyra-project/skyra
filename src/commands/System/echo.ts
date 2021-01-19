import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { MessageOptions, TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['talk'],
	description: LanguageKeys.Commands.System.EchoDescription,
	extendedHelp: LanguageKeys.Commands.System.EchoExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	runIn: ['text'],
	usage: '[channel:channel] [message:...string]',
	usageDelim: ' '
})
export default class extends SkyraCommand {
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
