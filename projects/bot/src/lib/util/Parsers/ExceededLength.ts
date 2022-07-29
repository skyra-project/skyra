import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getHaste } from '#utils/APIs/Hastebin';
import { promptForMessage } from '#utils/functions';
import { canSendAttachments } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { fetchT } from '@sapphire/plugin-i18next';
import { codeBlock } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';

export async function handleMessage<ED extends ExtraDataPartial>(
	message: Message,
	options: HandleMessageData<ED>
): Promise<Message | Message[] | null> {
	const t = await fetchT(message);
	const typeFooter = options.footer ? t(LanguageKeys.System.ExceededLengthOutputType, { type: options.footer }) : undefined;
	const timeTaken = options.time ? t(LanguageKeys.System.ExceededLengthOutputTime, { time: options.time }) : undefined;

	switch (options.sendAs) {
		case 'file': {
			if (canSendAttachments(message.channel)) {
				const output = t(LanguageKeys.System.ExceededLengthOutputFile);
				const content = [output, typeFooter, timeTaken].filter(Boolean).join('\n');

				const fileExtension = options.language ?? 'txt';
				const attachment = Buffer.from(options.content ? options.content : options.result!);
				const name = options.targetId ? `${options.targetId}.${fileExtension}` : `output.${fileExtension}`;
				return send(message, { content, files: [{ attachment, name }] });
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

				const content = [hastebinUrl, typeFooter, timeTaken].filter(Boolean).join('\n');
				return send(message, content);
			}

			options.hastebinUnavailable = true;

			await getTypeOutput(message, t, options);
			return handleMessage(message, options);
		}
		case 'console':
		case 'log': {
			if (options.canLogToConsole) {
				container.logger.info(options.result);
				const output = t(LanguageKeys.System.ExceededLengthOutputConsole);

				const content = [output, typeFooter, timeTaken].filter(Boolean).join('\n');
				return send(message, content);
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
				const content = codeBlock('md', options.content);
				return send(message, content);
			}

			if (options.success) {
				const parsedOutput = t(LanguageKeys.System.ExceededLengthOutput, { output: codeBlock(options.language!, options.result!) });

				const content = [parsedOutput, typeFooter, timeTaken].filter(Boolean).join('\n');
				return send(message, content);
			}

			const output = codeBlock(options.language ?? 'ts', options.result!);
			const content = t(LanguageKeys.Commands.System.EvalError, { time: options.time!, output, type: options.footer! });
			return send(message, content);
		}
	}
}

async function getTypeOutput<ED extends ExtraDataPartial>(message: Message, t: TFunction, options: HandleMessageData<ED>) {
	const _options = ['none', 'abort'];
	if (options.canLogToConsole) _options.push('log');

	if (canSendAttachments(message.channel)) _options.push('file');
	if (!options.hastebinUnavailable) _options.push('hastebin');

	let choice: string;
	do {
		const content = await promptForMessage(message, t(LanguageKeys.System.ExceededLengthChooseOutput, { output: _options }));
		choice = content?.toLowerCase() ?? 'none';
	} while (!_options.concat('none', 'abort').includes(choice));

	options.sendAs = choice;
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
