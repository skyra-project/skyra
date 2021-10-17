import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bot-info'],
	description: LanguageKeys.Commands.General.InfoDescription,
	detailedDescription: LanguageKeys.Commands.General.InfoExtended
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const content = args.t(LanguageKeys.Commands.General.InfoBody);
		return send(message, content);
	}
}
