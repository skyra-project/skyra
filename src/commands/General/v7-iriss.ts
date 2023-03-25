import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonInviteIriss, ButtonSkyraV7, createDeprecatedList, makeReplacedMessage, makeRow } from '#utils/deprecate';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

const list = createDeprecatedList({
	entries: [
		{ out: '</suggest:977945558406815797>', in: 'suggest' },
		{
			out: ['</resolve accept:977945558406815796>', '</resolve consider:977945558406815796>', '</resolve deny:977945558406815796>'],
			in: ['resolve-suggestion', 'resu']
		}
	]
});

const row = makeRow(ButtonInviteIriss, ButtonSkyraV7);

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7-iriss',
	aliases: [...list.keys()],
	description: LanguageKeys.Commands.General.V7Description,
	detailedDescription: LanguageKeys.Commands.General.V7Extended,
	hidden: true
})
export class UserCommand extends SkyraCommand {
	public messageRun(message: Message, args: SkyraCommand.Args) {
		return send(message, makeReplacedMessage(args.commandContext.commandName, row, list));
	}
}
