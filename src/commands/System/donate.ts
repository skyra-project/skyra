import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { isGuildMessage } from '#utils/common';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Result } from '@sapphire/result';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.DonateDescription,
	detailedDescription: LanguageKeys.Commands.System.DonateExtended,
	guarded: true
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		const content = args.t(this.detailedDescription).extendedHelp!;

		if (isGuildMessage(message)) {
			const result = await Result.fromAsync(message.author.send(content));
			const responseContent = args.t(result.isOk() ? LanguageKeys.Commands.System.DmSent : LanguageKeys.Commands.System.DmNotSent);
			await sendTemporaryMessage(message, responseContent);
		} else {
			await send(message, content);
		}
	}
}
