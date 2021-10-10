import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { fromAsync } from '@sapphire/framework';
import type { Message, MessageOptions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.DmDescription,
	detailedDescription: LanguageKeys.Commands.System.DmExtended,
	permissionLevel: PermissionLevels.BotOwner,
	quotes: []
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('user');
		const content = args.finished ? null : await args.rest('string');

		const attachment = message.attachments.size ? message.attachments.first()!.url : null;
		const options: MessageOptions = {
			content,
			files: attachment ? [{ attachment }] : undefined
		};

		const { success } = await fromAsync(user.send(options));

		const responseContent = success ? `Message successfully sent to ${user}` : `I am sorry, I could not send the message to ${user}`;
		return sendTemporaryMessage(message, responseContent);
	}
}
