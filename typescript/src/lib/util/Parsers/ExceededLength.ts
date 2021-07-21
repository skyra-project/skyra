import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getHaste } from '#utils/APIs/Hastebin';
import { canSendAttachments } from '#utils/functions';
import { codeBlock } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';

export async function handleMessage<ED extends ExtraDataPartial>(
	message: Message,
	options: HandleMessageData<ED>
): Promise<Message | Message[] | null> {
	const t = await message.fetchT();
	const typeFooter = options.footer ? t(LanguageKeys.System.ExceededLengthOutputType, { type: options.footer }) : undefined;
	const timeTaken = options.time ? t(LanguageKeys.System.ExceededLengthOutputTime, { time: options.time }) : undefined;

	switch (options.sendAs) {
		case 'file': {
			if (canSendAttachments(message.channel)) {
				const output = t(LanguageKeys.System.ExceededLengthOutputFile);
				return message.send([output, typeFooter, timeTaken].filter(Boolean), {
					files: [
						{
							attachment: Buffer.from(options.content ? options.content : options.result!),
							name: options.targetId ? `${options.targetId}.txt` : 'output.txt'
						}
					]
				});
			}

			await getTypeOutput(message, t, options);
			return handleMessage(message, options);
		}
		case 'haste':
		case 'hastebin': {
			if (!options.url) {
				options.url = await getHaste(options.content ? options.content : options.result!, options.language ?? 'md').catch(() => null);
			}

			if (options.url) {
				const hastebinUrl = t(LanguageKeys.System.ExceededLengthOutputHastebin, { url: options.url });
				return message.send([hastebinUrl, typeFooter, timeTaken].filter(Boolean));
			}

			options.hastebinUnavailable = true;

			await getTypeOutput(message, t, options);
			return handleMessage(message, options);
		}
		case 'console':
		case 'log': {
			if (options.canLogToConsole) {
				message.client.logger.info(options.result);
				const output = t(LanguageKeys.System.ExceededLengthOutputConsole);
				return message.send([output, typeFooter, timeTaken].filter(Boolean));
			}
			await getTypeOutput(message, t, options);
			return handleMessage(message, options);
		}
		case 'abort':
		case 'none':
			return null;
		default: {
			if (options.content ? options.content.length > 1950 : options.result!.length > 1950) {
				await getTypeOutput(message, t, options);
				return handleMessage(message, options);
			}

			if (options.content) {
				return message.send(options.content, { code: 'md' });
			}

			if (options.success) {
				const parsedOutput = t(LanguageKeys.System.ExceededLengthOutput, { output: codeBlock(options.language!, options.result!) });
				return message.send([parsedOutput, typeFooter, timeTaken].filter(Boolean));
			}

			return message.send(
				t(LanguageKeys.Commands.System.EvalError, {
					time: options.time!,
					output: codeBlock(options.language ?? 'ts', options.result!),
					type: options.footer!
				})
			);
		}
	}
}

async function getTypeOutput<ED extends ExtraDataPartial>(message: Message, t: TFunction, options: HandleMessageData<ED>) {
	const _options = ['none', 'abort'];
	if (options.canLogToConsole) _options.push('log');

	if (canSendAttachments(message.channel)) _options.push('file');
	if (!options.hastebinUnavailable) _options.push('hastebin');
	let _choice: { content: string };
	do {
		_choice = await message.prompt(t(LanguageKeys.System.ExceededLengthChooseOutput, { output: _options })).catch(() => ({ content: 'none' }));
	} while (!_options.concat('none', 'abort').includes(_choice.content));
	options.sendAs = _choice.content.toLowerCase();
}

type HandleMessageData<ED extends ExtraDataPartial> = {
	sendAs: string | null;
	hastebinUnavailable: boolean;
	url: string | null;
	canLogToConsole: boolean;
} & ED;

export interface EvalExtraData extends QueryExtraData {
	footer: string;
}

export interface ContentExtraData {
	content: string;
	targetId: string;
}

export interface QueryExtraData {
	success: boolean;
	result: string;
	time: string;
	language: string;
}

type ExtraDataPartial = Partial<EvalExtraData> & Partial<ContentExtraData> & Partial<QueryExtraData>;
