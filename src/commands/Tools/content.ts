import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, Serializer } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getContent } from '../../lib/util/util';
const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['source', 'msg-source', 'message-source'],
			cooldown: 15,
			description: language => language.tget('COMMAND_CONTENT_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_CONTENT_EXTENDED'),
			runIn: ['text'],
			usage: '[channel:channel] (message:message)',
			usageDelim: ' '
		});

		this.createCustomResolver('message', async (arg, _, message, [channel = message.channel as TextChannel]: TextChannel[]) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw message.language.tget('RESOLVER_INVALID_MSG', 'Message');
			const target = await channel.messages.fetch(arg).catch(() => null);
			if (target) return target;
			throw message.language.tget('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	public async run(message: KlasaMessage, [, target]: [TextChannel, KlasaMessage]) {
		const attachments = target.attachments.size
			? target.attachments.map(att => `📁 <${att.url}>`).join('\n')
			: '';
		const content = getContent(target);
		return message.sendMessage(`${content || ''}${content && attachments ? `\n\n\n=============\n${attachments}` : attachments}`, { code: 'md' });
	}

}
