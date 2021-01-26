import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Tools.VoteDescription,
	extendedHelp: LanguageKeys.Commands.Tools.VoteExtended,
	permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		// Even thought we don't use the argument, it's to require it so users don't do `s!vote` without args.
		await args.pick('string');

		for (const reaction of ['👍', '👎', '🤷']) {
			if (!message.reactions.cache.has(reaction)) await message.react(reaction);
		}

		return message;
	}
}
