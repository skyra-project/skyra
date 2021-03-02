import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { zalgo } from '@favware/zalgo';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Misc.ZalgoDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ZalgoExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const input = await args.rest('string', { maximum: 50 });

		return message.channel.send(
			args.t(LanguageKeys.Commands.Misc.ZalgoOutput, { str: zalgo(input, { down: false, middle: true, up: false, size: 'mini' }) })
		);
	}
}
