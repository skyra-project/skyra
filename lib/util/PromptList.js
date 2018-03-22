const { util } = require('klasa');
const promptOptions = { time: 30000, dispose: true, max: 1 };
function noop() { } // eslint-disable-line no-empty-function

/**
 * The PromptList class, inspired on Klasa's RichMenu, but single indexed.
 * @version 2.0.0
 * @since 2.0.0
 */
class PromptList {

	/**
	 * @typedef {Object} PromptListOptions
	 * @property {number} [maxAttempts = 5]
	 * @property {boolean} [listMode = false]
	 * @memberof PromptList
	 */

	/**
	 * @typedef {(Array<string|Array<string>> | Map<string, string> | Set<string> | Iterable<string>)} PromptListResolvable
	 * @memberof PromptList
	 */

	/**
	 * @since 3.0.0
	 * @param {PromptListResolvable} entries The entries to resolve.
	 */
	constructor(entries) {
		/**
		 * @since 3.0.0
		 * @type {string[]}
		 */
		this.entries = PromptList._resolveData(entries);
	}

	/**
	 * Run the PromptList
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message that runs this prompt
	 * @param {PromptListOptions} [options] The options
	 * @returns {Promise<number>}
	 */
	run(msg, options) {
		return PromptList._run(msg, this.entries, options, true);
	}

	/**
	 * Run the PromptList
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message that runs this prompt
	 * @param {PromptListResolvable} entries The entries to resolve
	 * @param {PromptListOptions} [options] The options
	 * @param {boolean} [resolved=false] Whether the entries are resolved or not
	 * @returns {Promise<number>}
	 */
	static async run(msg, entries, options, resolved = false) {
		const number = await PromptList._run(msg, resolved ? entries : PromptList._resolveData(entries), options);
		if (msg.responses) {
			await (Array.isArray(msg.responses)
				? Promise.all(msg.responses.map(response => response.delete().catch(noop)))
				: msg.responses.delete().catch(noop));
			msg.responses = null;
		}

		return number;
	}

	/**
	 * Run the prompt
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message that runs this prompt
	 * @param {string[]} list The list to show
	 * @param {PromptListOptions} options The options
	 * @returns {Promise<number>}
	 * @private
	 */
	static async _run(msg, list, { maxAttempts = 5, listMode = false } = {}) {
		const possibles = list.length;
		list = msg.client.methods.util.codeBlock('asciidoc', list.join('\n'));
		await msg.sendMessage(msg.language.get(listMode ? 'PROMPTLIST_LIST' : 'PROMPTLIST_MULTIPLE_CHOICE', list, possibles));
		const abortString = msg.language.get('PROMPTLIST_ABORT').toLowerCase();
		const promptFilter = (message) => message.author === msg.author
			&& (message.content.toLowerCase() === abortString || !isNaN(Number(message.content)));
		let response, number, attempts = 0;
		do {
			if (attempts !== 0) await msg.sendMessage(msg.language.get('PROMPTLIST_ATTEMPT_FAILED', list, attempts, maxAttempts));
			response = await msg.channel.awaitMessages(promptFilter, promptOptions)
				.then(responses => responses.size ? responses.first() : null);

			if (response) {
				if (response.deletable) response.delete().catch(noop);
				if (response.content.toLowerCase() === abortString) throw msg.language.get('PROMPTLIST_ABORTED');
				number = Number(response.content);
				if (!isNaN(number) && number >= 1 && number <= possibles) break;
			}
		} while (response && attempts++ < maxAttempts);

		if (attempts >= maxAttempts) throw null;
		return (number | 0) - 1;
	}

	/**
	 * @since 3.0.0
	 * @param {PromptListResolvable} data An Array, Map, Set or iterable object.
	 * @returns {string[]}
	 * @private
	 */
	static _resolveData(data) {
		const output = [];
		let maxLength, i = 0;

		if (Array.isArray(data)) {
			maxLength = Math.min(10, data.length);
			for (const entry of data)
				if (i >= maxLength) return output;
				else if (typeof entry === 'string') output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry}`;
				else if (Array.isArray(entry)) output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry.join(' : ')}`;
				else break;
		} else if (data instanceof Map) {
			maxLength = Math.min(10, data.size);
			for (const entry of data.entries())
				if (i >= maxLength) return output;
				else output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry.join(' : ')}`;
		} else if (data instanceof Set) {
			maxLength = Math.min(10, data.size);
			for (const entry of data || Symbol.iterator in data)
				if (i >= maxLength) return output;
				else output[i++] = `${i.toString().padStart(2, ' ')} :: ${entry}`;
		} else {
			throw new TypeError(`Expected an array, instance of Map, Set, or an iterable, but got: ${util.getDeepTypeName(data)}`);
		}

		if (i === maxLength) return output;
		throw new TypeError(`Expected an array, instance of Map, Set, or an iterable, but got: ${util.getDeepTypeName(data)}`);
	}

}

module.exports = PromptList;
