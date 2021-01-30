import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { MessageOptions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['talk'],
	description: LanguageKeys.Commands.System.EchoDescription,
	extendedHelp: LanguageKeys.Commands.System.EchoExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		if (message.deletable) message.nuke().catch(() => null);

		const channel = await args.pick('textChannel').catch(() => message.channel);
		const content = await args.rest('string').catch(() => '');

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
