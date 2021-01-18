import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['updoot'],
	description: LanguageKeys.Commands.Misc.UpvoteDescription,
	extendedHelp: LanguageKeys.Commands.Misc.UpvoteExtended
})
export default class extends SkyraCommand {
	public run(message: Message) {
		return message.sendTranslated(LanguageKeys.Commands.Misc.UpvoteMessage);
	}
}
