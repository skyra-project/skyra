import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['updoot'],
	description: LanguageKeys.Commands.Misc.UpvoteDescription,
	detailedDescription: LanguageKeys.Commands.Misc.UpvoteExtended
})
export class UserCommand extends SkyraCommand {
	public run(message: Message, args: SkyraCommand.Args) {
		const content = args.t(LanguageKeys.Commands.Misc.UpvoteMessage);
		return send(message, content);
	}
}
