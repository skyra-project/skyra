import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['updoot'],
	description: LanguageKeys.Commands.Misc.UpvoteDescription,
	extendedHelp: LanguageKeys.Commands.Misc.UpvoteExtended
})
export default class extends SkyraCommand {
	public run(message: Message) {
		return message.sendTranslated(LanguageKeys.Commands.Misc.UpvoteMessage);
	}
}
