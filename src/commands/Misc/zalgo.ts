import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { zalgo } from '@favware/zalgo';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Misc.ZalgoDescription,
	detailedDescription: LanguageKeys.Commands.Misc.ZalgoExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const input = await args.rest('string', { maximum: 50 });

		const content = args.t(LanguageKeys.Commands.Misc.ZalgoOutput, { str: zalgo(input, { down: false, middle: true, up: false, size: 'mini' }) });
		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}
}
