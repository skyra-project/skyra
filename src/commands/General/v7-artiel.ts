import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonInviteArtiel, ButtonSkyraV7, createDeprecatedList, makeReplacedMessage, makeRow } from '#utils/deprecate';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

const list = createDeprecatedList({
	entries: [
		{ out: '</dice:TBD>', in: ['dice', 'roll'] },
		{ out: '</bunny:TBD>', in: ['bunny', 'bunbun', 'rabbit'] },
		{ out: '</cat:TBD>', in: ['kitty', 'kitten', 'cat'] },
		{ out: '</dog:TBD>', in: ['dog', 'doggo', 'puppy'] },
		{ out: '</fox:TBD>', in: ['fox'] },
		{ out: '</shibe:TBD>', in: ['shibe'] },
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
