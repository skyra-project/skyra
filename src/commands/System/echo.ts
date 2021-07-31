import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { deleteMessage, sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { UserError } from '@sapphire/framework';
import type { MessageOptions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['talk'],
	description: LanguageKeys.Commands.System.EchoDescription,
	extendedHelp: LanguageKeys.Commands.System.EchoExtended,
	permissionLevel: PermissionLevels.BotOwner,
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		if (message.deletable) deleteMessage(message).catch(() => null);

		const channel = await args.pick('textOrNewsChannelName').catch(() => message.channel);
		const content = args.finished ? null : await args.rest('string');

		const attachment = message.attachments.size ? message.attachments.first()!.url : null;

		if (!content && !attachment) {
			throw new UserError({
				identifier: `you-suck-${message.author.username}`,
				message: 'I have no content nor attachment to send, please write something.'
			});
		}

		const options: MessageOptions = {
			content,
			files: attachment ? [{ attachment }] : undefined
		};

		await channel.send(options);
		if (channel !== message.channel) await sendTemporaryMessage(message, `Message successfully sent to ${channel}`);

		return message;
	}
}
