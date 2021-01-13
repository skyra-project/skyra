import { Serializer } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ZeroWidthSpace } from '#utils/constants';
import { ContentExtraData, handleMessage } from '#utils/ExceededLengthParser';
import { escapeCodeBlock } from '#utils/External/escapeMarkdown';
import { getContent } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Message, TextChannel } from 'discord.js';

const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['source', 'msg-source', 'message-source'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.ContentDescription,
	extendedHelp: LanguageKeys.Commands.Tools.ContentExtended,
	usage: '[channel:textchannelname] (message:message)',
	usageDelim: ' ',
	flagSupport: true
})
export default class extends SkyraCommand {
	public async init() {
		this.createCustomResolver('message', async (arg, _, message, [channel = message.channel as TextChannel]: TextChannel[]) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidMessage, { name: 'Message' });
			const target = await channel.messages.fetch(arg).catch(() => null);
			if (target) return target;
			throw await message.resolveKey(LanguageKeys.System.MessageNotFound);
		});
	}

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
