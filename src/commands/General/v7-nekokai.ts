import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonInviteNekokai, ButtonSkyraV7, createDeprecatedList, makeReplacedMessage, makeRow } from '#utils/deprecate';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message } from 'discord.js';

const list = createDeprecatedList({
	entries: [
		{ out: '</anime anilist:1003244486983434321>', in: ['ani-list', 'anime'] },
		{ out: '</anime kitsu:1003244486983434321>', in: ['kitsu-anime'] },
		{ out: '</manga anilist:1003244486983434320>', in: ['manga-list', 'manga'] },
		{ out: '</manga kitsu:1003244486983434320>', in: ['kitsu-manga'] },
		{ out: '</waifu:1003244314790469702>', in: ['waifu'] },
		{ out: '</slap:970364636828426287>', in: ['slap'] },
		{ out: '</bang:970364636987793443>', in: ['wbang'] },
		{ out: '</bang-head:970364636828426286>', in: ['wbanghead'] },
		{ out: '</bite:970364636828426284>', in: ['wbite'] },
		{ out: '</blush:970364636828426282>', in: ['wblush'] },
		{ out: '</cry:970364637201698898>', in: ['wcry'] },
		{ out: '</cuddle:970364636987793440>', in: ['wcuddle'] },
		{ out: '</dance:970364636828426281>', in: ['wdance'] },
		{ out: '</greet:970364636987793447>', in: ['wgreet', 'wsalute'] },
		{ out: '</hug:970364636828426288>', in: ['whug'] },
		{ out: '</kiss:970364636987793438>', in: ['wkiss'] },
		{ out: '</lewd:970364637122015284>', in: ['wlewd'] },
		{ out: '</lick:970364637122015290>', in: ['wlick'] },
		{ out: '</neko:970364636987793439>', in: ['wneko'] },
		{ out: '</nom:970364636987793445>', in: ['wnom'] },
		{ out: '</pat:970364637201698897>', in: ['wpat'] },
		{ out: '</pout:970364636987793444>', in: ['wpout'] },
		{ out: '</punch:970364636828426289>', in: ['wpunch'] },
		{ out: '</slap:970364636828426287>', in: ['wslap'] },
		{ out: '</sleepy:970364636987793442>', in: ['wsleepy'] },
		{ out: '</smile:970364637201698896>', in: ['wsmile'] },
		{ out: '</smug:970364637122015288>', in: ['wsmug'] },
		{ out: '</stare:970364637122015283>', in: ['wstare'] },
		{ out: '</thumbs-up:970364636828426285>', in: ['wthumbsup'] },
		{ out: '</tickle:970364637122015289>', in: ['wtickle'] }
	]
});

const row = makeRow(ButtonInviteNekokai, ButtonSkyraV7);

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7-nekokai',
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
