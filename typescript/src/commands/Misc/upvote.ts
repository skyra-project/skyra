import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['updoot'],
	description: LanguageKeys.Commands.Misc.UpvoteDescription,
	extendedHelp: LanguageKeys.Commands.Misc.UpvoteExtended
})
export class UserCommand extends SkyraCommand {
	public run(message: Message, args: SkyraCommand.Args) {
		return message.channel.send(args.t(LanguageKeys.Commands.Misc.UpvoteMessage));
	}
}
