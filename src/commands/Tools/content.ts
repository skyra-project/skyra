import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { escapeCodeBlock } from '#utils/External/escapeMarkdown';
import { formatAttachment, formatMessage } from '#utils/formatters';
import { handleMessage } from '#utils/Parsers/ExceededLength';
import { getAllContent, getContent } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

const allPlain = ['all', 'all-plain', 'all-plain-text'];
const allFormat = ['format', 'formatted', 'all-format', 'all-formatted'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['source', 'msg-source', 'message-source'],
	strategyOptions: { options: ['output', 'output-to'], flags: [...allPlain, ...allFormat] },
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
		const content = escapeCodeBlock(this.getContent(args, target as GuildMessage));

		const sendAs = args.getOption('output', 'output-to');
		return handleMessage(message, {
			sendAs,
			content,
			targetId: target.id,
			hastebinUnavailable: false,
			url: null,
			canLogToConsole: false
		});
	}

	private getContent(args: SkyraCommand.Args, message: GuildMessage) {
		if (args.getFlags(...allPlain)) return this.join(getAllContent(message), this.getAttachments(message));
		if (args.getFlags(...allFormat)) return formatMessage(args.t, message);
		return this.join(getContent(message) ?? '', this.getAttachments(message));
	}

	private getAttachments(message: GuildMessage) {
		return message.attachments.map(formatAttachment).join('\n');
	}

	private join(content: string, attachments: string) {
		if (content.length === 0) return attachments;
		if (attachments.length === 0) return content;
		return `${content}\n\n${attachments}`;
	}
}
