import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonInviteDragonite, ButtonSkyraV7, createDeprecatedList, makeReplacedMessage, makeRow } from '#utils/deprecate';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

const list = createDeprecatedList({
	entries: [
		{ out: '</ability:942137485973135381>', in: ['abilities', 'ability', 'pokeability'] },
		{ out: '</flavor:942137488883978251>', in: ['flavor', 'flavors', 'flavour', 'flavours'] },
		{ out: '</item:942137572665196574>', in: ['item', 'pokeitem', 'bag'] },
		{ out: '</learn:942137402686857248>', in: ['learn', 'learnall', 'learnset'] },
		{ out: '</move:942137486510018571>', in: ['move'] },
		{ out: '</pokemon:942137488242262096>', in: ['dex', 'dexter', 'mon', 'poke', 'pokedex', 'pokemon'] },
		{ out: '</sprite:942137402300981268>', in: ['pokeimage', 'pokesprite', 'sprite'] },
		{ out: '</type-matchup:942137487571173376>', in: ['advantage', 'matchup', 'type', 'weakness'] }
	]
});

const row = makeRow(ButtonInviteDragonite, ButtonSkyraV7);

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7-pokemon',
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
