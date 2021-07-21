import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { safeWrapPromise } from '#utils/common';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message, MessageOptions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.DmDescription,
	extendedHelp: LanguageKeys.Commands.System.DmExtended,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('user');
		const content = await args.rest('string');

		const attachment = message.attachments.size > 0 ? message.attachments.first()!.url : null;
		const options: MessageOptions = {};
		if (attachment) options.files = [{ attachment }];

		const { success } = await safeWrapPromise(user.send(content, options));

		const responseContent = success ? `Message successfully sent to ${user}` : `I am sorry, I could not send the message to ${user}`;
		return sendTemporaryMessage(message, responseContent);
	}
}
