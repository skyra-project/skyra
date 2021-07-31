import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { codeBlock } from '@sapphire/utilities';
import { get, send } from '@skyra/editable-commands';
import type { Message } from 'discord.js';
import { deleteMessage } from './functions';

const kPromptOptions = { time: 30000, dispose: true, max: 1 };
const kAttempts = 5;

/**
 * Run the prompt
 * @param message The message that runs this prompt
 * @param entries The entries to resolve
 */
export async function prompt(message: Message, entries: PromptListResolvable) {
	const n = await ask(message, [...resolve(entries, 10)]);
	const response = get(message);
	if (response) await deleteMessage(response).catch(() => null);
	return n;
}

/**
 * Retrieve the number via prompts
 * @param message The message that runs this prompt
 * @param list The list to show
 * @private
 */
async function ask(message: Message, list: readonly string[]) {
	const possibles = list.length;
	const codeblock = codeBlock('asciidoc', list.join('\n'));
	const t = await fetchT(message);
	const responseMessage = await send(
		message,
		t(LanguageKeys.PromptList.MultipleChoice, {
			list: codeblock,
			count: possibles
		})
	);
	const abortOptions = t(LanguageKeys.Misc.TextPromptAbortOptions);
	const promptFilter = (m: Message) =>
		m.author === message.author && (abortOptions.includes(m.content.toLowerCase()) || !Number.isNaN(Number(m.content)));
	let response: Message | null = null;
	let n = NaN;
	let attempts = 0;
	do {
		if (attempts !== 0) {
			await send(message, t(LanguageKeys.PromptList.AttemptFailed, { list: codeblock, attempt: attempts, maxAttempts: kAttempts }));
		}
		response = await message.channel
			.awaitMessages({ filter: promptFilter, ...kPromptOptions })
			.then((responses) => (responses.size ? responses.first()! : null));

		if (response) {
			if (response.deletable) deleteMessage(response).catch(() => null);
			if (abortOptions.includes(response.content.toLowerCase())) throw new UserError({ identifier: LanguageKeys.PromptList.Aborted });
			n = Number(response.content);
			if (!Number.isNaN(n) && n >= 1 && n <= possibles) {
				await responseMessage.delete();
				break;
			}
		}
	} while (response && attempts++ < kAttempts);

	if (!response || attempts >= kAttempts) throw null;
	return (n ?? 0) - 1;
}

function* resolve(data: PromptListResolvable, maxLength: number): Iterable<string> {
	let i = 0;
	for (const entry of data) {
		if (typeof entry === 'string') yield `${(i + 1).toString().padStart(2, ' ')} :: ${entry}`;
		else if (Array.isArray(entry)) yield `${(i + 1).toString().padStart(2, ' ')} :: ${entry.join(' : ')}`;

		if (++i >= maxLength) break;
	}
}

type PromptListResolvable = Iterable<string> | Iterable<[string, string]>;
