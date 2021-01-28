import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ZeroWidthSpace } from '#utils/constants';
import { escapeCodeBlock } from '#utils/External/escapeMarkdown';
import { handleMessage } from '#utils/Parsers/ExceededLength';
import { getContent } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['source', 'msg-source', 'message-source'],
	strategyOptions: { flags: ['output', 'output-to'], options: ['log'] },
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.ContentDescription,
	extendedHelp: LanguageKeys.Commands.Tools.ContentExtended
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		// Retrieve the target message:
		const channel = await args.pick('textChannelName').catch(() => message.channel);
		const target = await args.pick('message', { channel });

		// Parse the message content:
		const attachments = target.attachments.size ? target.attachments.map((att) => `📁 <${att.url}>`).join('\n') : '';
		const content = escapeCodeBlock(getContent(target) || ZeroWidthSpace);

		const sendAs = args.getOption('output', 'output-to') ?? (args.getFlags('log') ? 'log' : null);
		return handleMessage(message, {
			sendAs,
			attachments,
			content,
			targetId: target.id,
			hastebinUnavailable: false,
			url: null,
			canLogToConsole: false
		});
	}
}
