import { Message } from 'discord.js';
const promptOptions = { time: 30000, dispose: true, max: 1 };
function noop() { } // eslint-disable-line no-empty-function

export interface PromptListOptions {
	maxAttempts?: number;
	listMode?: boolean;
}

export type PromptListResolvable = Array<string | Array<string>> | Map<string, string> | Set<string> | IterableIterator<string>;

/**
 * The PromptList class, inspired on Klasa's RichMenu, but single indexed.
 * @version 2.0.0
 */
export class PromptList {

	public constructor(entries: PromptListResolvable) {
		/**
		 * @type {string[]}
		 */
		this.entries = PromptList._resolveData(entries);
	}

	/**
	 * Run the PromptList
	 * @param {KlasaMessage} msg The message that runs this prompt
	 * @param {PromptListOptions} [options] The options
	 * @returns {Promise<number>}
	 */
	public run(msg, options) {
		return PromptList._run(msg, this.entries, options);
	}

	/**
	 * Run the PromptList
	 * @param {KlasaMessage} message The message that runs this prompt
	 * @param {PromptListResolvable} entries The entries to resolve
	 * @param {PromptListOptions} [options] The options
	 * @param {boolean} [resolved=false] Whether the entries are resolved or not
	 * @returns {Promise<number>}
	 */
	public static async run(message: Message, entries: PromptListResolvable, options: PromptListOptions, resolved: boolean = false): Promise<number> {
		const n = await PromptList._run(message, resolved ? entries as string[] : PromptList._resolveData(entries), options);
		if (message._responses.length) {
			await Promise.all(message.responses.map((response) => response.nuke().catch(noop)));
			message._responses = [];
		}

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
		list = util.codeBlock('asciidoc', list.join('\n'));
		await message.sendLocale(listMode ? 'PROMPTLIST_LIST' : 'PROMPTLIST_MULTIPLE_CHOICE', [list, possibles]);
		const abortString = message.language.get('PROMPTLIST_ABORT').toLowerCase();
		const promptFilter = (m: Message) => m.author === m.author
			&& (m.content.toLowerCase() === abortString || !isNaN(Number(m.content)));
		let response, n, attempts = 0;
		do {
			if (attempts !== 0) await message.sendLocale('PROMPTLIST_ATTEMPT_FAILED', [list, attempts, maxAttempts]);
			response = await message.channel.awaitMessages(promptFilter, promptOptions)
				.then((responses) => responses.size ? responses.first() : null);

			if (response) {
				if (response.deletable) response.nuke().catch(noop);
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
		let maxLength, i = 0;

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
				else output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry.join(' : ')}`;
			}
		} else if (data instanceof Set) {
			maxLength = Math.min(10, data.size);
			for (const entry of data) {
				if (i >= maxLength) return output;
				else output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry}`;
			}
		} else {
			throw new TypeError(`Expected an array, instance of Map, Set, or an iterable, but got: ${util.getDeepTypeName(data)}`);
		}

		if (i === maxLength) return output;
		throw new TypeError(`Expected an array, instance of Map, Set, or an iterable, but got: ${util.getDeepTypeName(data)}`);
	}

}
