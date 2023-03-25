import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ButtonInviteTeryl, ButtonSkyraV7, createDeprecatedList, makeReplacedMessage, makeRow } from '#utils/deprecate';
import { inlineCode } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

const list = createDeprecatedList({
	entries: [
		{ out: '</choice:1078828281555603487>', in: ['choice', 'choise', 'choose', 'pick'] },
		{ out: '</color:1078828281949859983>', in: ['color', 'colour'] },
		{ out: '</create-emoji:1078828281555603495>', in: ['add-emoji', 'create-emoji'] },
		{ out: '</dictionary:1078828281555603490>', in: ['def', 'defination', 'define', 'definition', 'dictionary'] },
		{ out: '</emoji:1078828281949859982>', in: ['emoji', 'emote'] },
		{ out: '</poll:1078828281949859987>', in: ['poll', 'spoll'] },
		{ out: '</price:1078828281555603489>', in: ['currency', 'exchange', 'money', 'price'] },
		{ out: '</reddit:1078828281555603492>', in: ['rand', 'rand-reddit', 'reddit'] },
		{ out: '</twitch followage:1078828281555603488>', in: ['followage'] },
		{ out: '</twitch user:1078828281555603488>', in: ['twitch'] },
		{ out: '</weather:1078828281555603494>', in: ['weather'] },
		{ out: '</wikipedia:1078828281555603491>', in: ['wiki', 'wikipedia'] },
		{ out: '</youtube:1078828281555603493>', in: ['youtube', 'yt'] },
		{ out: inlineCode('Apps > Get Message JSON'), in: ['content', 'message-source', 'msg-source', 'source'] }
	]
});

const row = makeRow(ButtonInviteTeryl, ButtonSkyraV7);

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7-teryl',
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
