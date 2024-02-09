import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonInviteTeryl, ButtonSkyraV7, createDeprecatedList, makeReplacedMessage, makeRow } from '#utils/deprecate';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

const list = createDeprecatedList({
	entries: [{ out: '</reminders create:1078828281949859985>', in: ['remindme', 'rmm', 'remind', 'reminder', 'reminders'] }]
});

const row = makeRow(ButtonInviteTeryl, ButtonSkyraV7);

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7-teryl',
	aliases: [...list.keys()],
	description: LanguageKeys.Commands.General.V7Description,
	detailedDescription: LanguageKeys.Commands.General.V7Extended,
	generateDashLessAliases: false,
	hidden: true
})
export class UserCommand extends SkyraCommand {
	public override messageRun(message: Message, args: SkyraCommand.Args) {
		return send(message, makeReplacedMessage(args.commandContext.commandName, row, list));
	}
}
