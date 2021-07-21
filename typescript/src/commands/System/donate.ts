import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { isGuildMessage, safeWrapPromise } from '#utils/common';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.DonateDescription,
	extendedHelp: LanguageKeys.Commands.System.DonateExtended,
	guarded: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const content = args.t(this.extendedHelp).extendedHelp!;

		if (isGuildMessage(message)) {
			const { success } = await safeWrapPromise(message.author.send(content));
			const responseContent = args.t(success ? LanguageKeys.Commands.System.DmSent : LanguageKeys.Commands.System.DmNotSent);
			await sendTemporaryMessage(message, responseContent);
		} else {
			await message.send(content);
		}
	}
}
