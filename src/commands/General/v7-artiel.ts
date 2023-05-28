import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonInviteArtiel, ButtonSkyraV7, createDeprecatedList, makeReplacedMessage, makeRow } from '#utils/deprecate';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

const list = createDeprecatedList({
	entries: [
		{ out: '</meme:TBD>', in: ['changemymind', 'cmm'] },
		{ out: '</meme:TBD>', in: ['chase'] },
		{ out: '</meme:TBD>', in: ['cuddle'] },
		{ out: '</meme:TBD>', in: ['deletthis', 'deletethis'] },
		{ out: '</meme:TBD>', in: ['f', 'pray'] },
		{ out: '</meme:TBD>', in: ['good-night', 'gn', 'night'] },
		{ out: '</meme:TBD>', in: ['goofytime', 'goof', 'goofy', 'daddy', 'goofie', 'goofietime'] },
		{ out: '</meme:TBD>', in: ['hug'] },
		{ out: '</meme:TBD>', in: ['ineedhealing', 'heal', 'healing'] },
		{ out: '</meme:TBD>', in: ['shindeiru'] },
		{ out: '</meme:TBD>', in: ['ship'] },
		{ out: '</meme:TBD>', in: ['thesearch'] },
		{ out: '</meme:TBD>', in: ['think'] },
		{ out: '</meme:TBD>', in: ['triggered'] },
		{ out: '</meme:TBD>', in: ['wakanda'] },
		{ out: '</meme:TBD>', in: ['where'] },
		{ out: '</xkcd:TBD>', in: ['xkcd'] }
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
	public messageRun(message: Message, args: SkyraCommand.Args) {
		return send(message, makeReplacedMessage(args.commandContext.commandName, row, list));
	}
}
