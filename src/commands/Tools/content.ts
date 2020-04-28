import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { fetch, FetchMethods, FetchResultTypes, getContent } from '@utils/util';
import { TextChannel, Util } from 'discord.js';
import { KlasaMessage, Serializer } from 'klasa';

const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['source', 'msg-source', 'message-source'],
	cooldown: 15,
	description: language => language.tget('COMMAND_CONTENT_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_CONTENT_EXTENDED'),
	runIn: ['text'],
	usage: '[channel:channelname] (message:message)',
	usageDelim: ' ',
	flagSupport: true
})
export default class extends SkyraCommand {

	public async init() {
		this.createCustomResolver('message', async (arg, _, message, [channel = message.channel as TextChannel]: TextChannel[]) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw message.language.tget('RESOLVER_INVALID_MESSAGE', 'Message');
			const target = await channel.messages.fetch(arg).catch(() => null);
			if (target) return target;
			throw message.language.tget('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	public async run(message: KlasaMessage, [, target]: [TextChannel, KlasaMessage]) {
		const attachments = target.attachments.size
			? target.attachments.map(att => `📁 <${att.url}>`).join('\n')
			: '';
		const content = Util.escapeCodeBlock(getContent(target) || '');

		const sendAs = message.flagArgs.output || message.flagArgs['output-to'] || (message.flagArgs.log ? 'log' : null);
		return this.handleMessage(message, content, { sendAs, targetId: target.id, hastebinUnavailable: false, url: null, attachments });
	}

	private async handleMessage(message: KlasaMessage, content: string, options: HandleMessageData): Promise<KlasaMessage | KlasaMessage[] | null> {
		switch (options.sendAs) {
			case 'file': {
				if (message.channel.attachable) {
					return message.channel.sendFile(
						Buffer.from(content), `${options.targetId}.txt`, message.language.tget('COMMAND_CONTENT_OUTPUT_FILE')
					);
				}

				await this.getTypeOutput(message, options);
				return this.handleMessage(message, content, options);
			}
			case 'haste':
			case 'hastebin': {
				if (!options.url) options.url = await this.getHaste(content).catch(() => null);
				if (options.url) return message.sendLocale('COMMAND_CONTENT_OUTPUT_HASTEBIN', [options.url]);
				options.hastebinUnavailable = true;
				await this.getTypeOutput(message, options);
				return this.handleMessage(message, content, options);
			}
			case 'abort':
			case 'none':
				return null;
			default: {
				if (content.length > 1980) {
					await this.getTypeOutput(message, options);
					return this.handleMessage(message, content, options);
				}
				return message.sendMessage(
					`${content}${content && options.attachments ? `\n\n\n=============\n${options.attachments}` : options.attachments}`, { code: 'md' }
				);
			}
		}
	}

	private async getHaste(evalResult: string) {
		const { key } = await fetch('https://hasteb.in/documents', { method: FetchMethods.Post, body: evalResult }, FetchResultTypes.JSON) as { key: string };
		return `https://hasteb.in/${key}.md`;
	}

	private async getTypeOutput(message: KlasaMessage, options: HandleMessageData) {
		const _options = ['none', 'abort'];
		if (message.channel.attachable) _options.push('file');
		if (!options.hastebinUnavailable) _options.push('hastebin');
		let _choice: { content: string };
		do {
			_choice = await message.prompt(message.language.tget('COMMAND_CONTENT_CHOOSE_OUTPUT', _options)).catch(() => ({ content: 'none' }));
		}
		while (!_options.concat('none', 'abort').includes(_choice.content));
		options.sendAs = _choice.content.toLowerCase();
	}

}

interface HandleMessageData {
	sendAs: string | null;
	targetId: string;
	attachments: string;
	hastebinUnavailable: boolean;
	url: string | null;
}
