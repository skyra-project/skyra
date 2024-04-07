import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonSkyraV7, makeRemovedMessage, makeRow } from '#utils/deprecate';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

const row = makeRow(ButtonSkyraV7);

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7',
	aliases: ['ping', 'pong'],
	description: LanguageKeys.Commands.General.V7Description,
	detailedDescription: LanguageKeys.Commands.General.V7Extended,
	hidden: true
})
export class UserCommand extends SkyraCommand {
	public messageRun(message: Message, args: SkyraCommand.Args) {
		return send(message, makeRemovedMessage(args.commandContext.commandName, row));
	}
}
