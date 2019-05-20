import { Message } from 'discord.js';
import { Type, util } from 'klasa';
const promptOptions = { time: 30000, dispose: true, max: 1 };

/**
 * The PromptList class, inspired on Klasa's RichMenu, but single indexed.
 * @version 2.0.0
 */
export class PromptList {

	public entries: string[];

	public constructor(entries: PromptListResolvable) {
		this.entries = PromptList._resolveData(entries);
	}

	/**
	 * Run the PromptList
	 * @param message The message that runs this prompt
	 * @param options The options
	 */
	public run(message: Message, options?: PromptListOptions): Promise<number> {
		return PromptList._run(message, this.entries, options);
	}

	/**
	 * Run the PromptList
	 * @param message The message that runs this prompt
	 * @param entries The entries to resolve
	 * @param options The options
	 * @param resolved Whether the entries are resolved or not
	 */
	public static async run(message: Message, entries: PromptListResolvable, options?: PromptListOptions, resolved: boolean = false): Promise<number> {
		const n = await PromptList._run(message, resolved ? entries as string[] : PromptList._resolveData(entries), options);
		await Promise.all(message.responses.map(response => response.nuke().catch(() => null)));
		return n;
	}

	/**
	 * Run the prompt
	 * @param message The message that runs this prompt
	 * @param list The list to show
	 * @param options The options
	 */
	private static async _run(message: Message, list: string[], { maxAttempts = 5, listMode = false }: PromptListOptions = {}): Promise<number> {
		const possibles = list.length;
		const codeblock = util.codeBlock('asciidoc', list.join('\n'));
		await message.sendLocale(listMode ? 'PROMPTLIST_LIST' : 'PROMPTLIST_MULTIPLE_CHOICE', [codeblock, possibles]);
		const abortString = message.language.get('PROMPTLIST_ABORT').toLowerCase();
		const promptFilter = (m: Message) => m.author === message.author
			&& (m.content.toLowerCase() === abortString || !isNaN(Number(m.content)));
		let response: Message;
		let n: number;
		let attempts = 0;
		do {
			if (attempts !== 0) await message.sendLocale('PROMPTLIST_ATTEMPT_FAILED', [codeblock, attempts, maxAttempts]);
			response = await message.channel.awaitMessages(promptFilter, promptOptions)
				.then(responses => responses.size ? responses.first() : null);

			if (response) {
				if (response.deletable) response.nuke().catch(() => null);
				if (response.content.toLowerCase() === abortString) throw message.language.get('PROMPTLIST_ABORTED');
				n = Number(response.content);
				if (!isNaN(n) && n >= 1 && n <= possibles) break;
			}
		} while (response && attempts++ < maxAttempts);

		if (!response || attempts >= maxAttempts) throw null;
		return (n | 0) - 1;
	}

	/**
	 * @param data An Array, Map, Set or iterable object.
	 */
	private static _resolveData(data: PromptListResolvable): string[] {
		const output = [];
		let maxLength: number;
		let i = 0;

		if (Array.isArray(data)) {
			maxLength = Math.min(10, data.length);
			for (const entry of data) {
				if (i >= maxLength) return output;
				else if (typeof entry === 'string') output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry}`;
				else if (Array.isArray(entry)) output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry.join(' : ')}`;
				else break;
			}
		} else if (data instanceof Map) {
			maxLength = Math.min(10, data.size);
			for (const entry of data.entries()) {
				if (i >= maxLength) return output;
				output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry.join(' : ')}`;
			}
		} else if (data instanceof Set) {
			maxLength = Math.min(10, data.size);
			for (const entry of data) {
				if (i >= maxLength) return output;
				output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry}`;
			}
		} else {
			throw new TypeError(`Expected an array, instance of Map, Set, or an iterable, but got: ${new Type(data)}`);
		}

		if (i === maxLength) return output;
		throw new TypeError(`Expected an array, instance of Map, Set, or an iterable, but got: ${new Type(data)}`);
	}

}

interface PromptListOptions {
	maxAttempts?: number;
	listMode?: boolean;
}

type PromptListResolvable = Array<string | Array<string>> | Map<string, string> | Set<string> | IterableIterator<string>;
