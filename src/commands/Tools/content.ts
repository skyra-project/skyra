import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ZeroWidthSpace } from '#utils/constants';
import { escapeCodeBlock } from '#utils/External/escapeMarkdown';
import { ContentExtraData, handleMessage } from '#utils/Parsers/ExceededLength';
import { getContent } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolver } from '@skyra/decorators';
import type { Message, TextChannel } from 'discord.js';

const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['source', 'msg-source', 'message-source'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.ContentDescription,
	extendedHelp: LanguageKeys.Commands.Tools.ContentExtended,
	usage: '[channel:textchannelname] (message:message)',
	usageDelim: ' ',
	flagSupport: true
})
@CreateResolver('message', async (arg, _, message, [channel = message.channel as TextChannel]: TextChannel[]) => {
	if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidMessage, { name: 'Message' });
	const target = await channel.messages.fetch(arg).catch(() => null);
	if (target) return target;
	throw await message.resolveKey(LanguageKeys.System.MessageNotFound);
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, [, target]: [TextChannel, Message]) {
		const attachments = target.attachments.size ? target.attachments.map((att) => `📁 <${att.url}>`).join('\n') : '';
		const content = escapeCodeBlock(getContent(target) || ZeroWidthSpace);

		const sendAs =
			(Reflect.get(message.flagArgs, 'output') || Reflect.get(message.flagArgs, 'output-to') || Reflect.get(message.flagArgs, 'log')) ?? null;

		return handleMessage<Partial<ContentExtraData>>(message, {
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
