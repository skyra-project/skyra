import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonInviteArtiel, ButtonSkyraV7, createDeprecatedList, makeReplacedMessage, makeRow } from '#utils/deprecate';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

const list = createDeprecatedList({
	entries: [
		{ out: '</dice:1201144153023709234>', in: ['dice', 'roll'] },
		{ out: '</bunny:1201144152465883271>', in: ['bunny', 'bunbun', 'rabbit'] },
		{ out: '</cat:1201144153023709235>', in: ['kitty', 'kitten', 'cat'] },
		{ out: '</dog:1201144152465883268>', in: ['dog', 'doggo', 'puppy'] },
		{ out: '</fox:1201144152465883269>', in: ['fox'] },
		{ out: '</shibe:1201144152465883270>', in: ['shibe'] },
		{
			out: '</meme:1116785425240047720>',
			in: [
				'changemymind',
				'cmm',
				'chase',
				'cuddle',
				'deletthis',
				'deletethis',
				'f',
				'pray',
				'good-night',
				'gn',
				'night',
				'goofytime',
				'goof',
				'goofy',
				'daddy',
				'goofie',
				'goofietime',
				'hug',
				'ineedhealing',
				'heal',
				'healing',
				'shindeiru',
				'thesearch',
				'think',
				'triggered',
				'wakanda',
				'where'
			]
		},
		{ out: '</ship:1116785425240047721>', in: ['ship'] },
		{ out: '</xkcd:1116785425240047719>', in: ['xkcd'] }
	]
});

const row = makeRow(ButtonInviteArtiel, ButtonSkyraV7);

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7-artiel',
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
