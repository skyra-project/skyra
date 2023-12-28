import { remove as removeConfusables } from 'confusables';
import { isMainThread, parentPort } from 'node:worker_threads';

if (isMainThread || parentPort === null) throw new Error('The Worker may only be ran via the worker_threads fork method!');

/** @typedef {import('./types.js').IncomingType} IncomingType */
/** @typedef {import('./types.js').IncomingRunRegExpPayload} IncomingRunRegExpPayload */
/** @typedef {import('./types.js').OutgoingPayload} OutgoingPayload */
/** @typedef {import('./types.js').OutgoingRegExpMatchPayload} OutgoingRegExpMatchPayload */

const IncomingType = {
	RunRegExp: 0
};

const OutgoingType = {
	Heartbeat: 0,
	UnknownCommand: 1,
	NoContent: 2,
	RegExpMatch: 3
};

/**
 * @param {OutgoingPayload} message
 */
function post(message) {
	return parentPort.postMessage(message);
}

post({ type: OutgoingType.Heartbeat });

setInterval(() => post({ type: OutgoingType.Heartbeat }), 45000).unref();

parentPort.on('message', (message) => post(handleMessage(message)));

/**
 * @param {IncomingPayload} message
 * @returns {OutgoingPayload}
 */
function handleMessage(message) {
	switch (message.type) {
		case IncomingType.RunRegExp:
			return handleRunRegExp(message);
		default:
			return { id: message.id, type: OutgoingType.UnknownCommand };
	}
}

/**
 * Handles running a regular expression filter on a message's content after removing confusables.
 * @param {IncomingRunRegExpPayload} message - The message object to filter.
 * @returns {OutgoingPayload} - The filtered message content, if any.
 */
function handleRunRegExp(message) {
	// Remove confusables and run filter:
	const result = filter(removeConfusables(message.content), message.regExp);
	if (result === null) return { id: message.id, type: OutgoingType.NoContent };

	// Post the results:
	return { id: message.id, type: OutgoingType.RegExpMatch, filtered: result.filtered, highlighted: result.highlighted };
}

/** @typedef {Pick<OutgoingRegExpMatchPayload, 'filtered' | 'highlighted'>} RegExpMatchResult */

/**
 * Filters a string based on a regular expression, replacing matching sections with asterisks and returning both the filtered and highlighted versions.
 *
 * @param {string} str - The string to filter.
 * @param {RegExp} regex - The regular expression to match against.
 * @returns {RegExpMatchResult | null}
 */
function filter(str, regex) {
	const matches = str.match(regex);
	if (matches === null) return null;

	let last = 0;
	let next = 0;

	const filtered = [];
	const highlighted = [];
	for (const match of matches) {
		next = str.indexOf(match, last);
		const section = str.slice(last, next);
		if (section) {
			filtered.push(section, '*'.repeat(match.length));
			highlighted.push(section, `__${match}__`);
		} else {
			filtered.push('*'.repeat(match.length));
			highlighted.push(`__${match}__`);
		}
		last = next + match.length;
	}

	if (last !== str.length) {
		const end = str.slice(last);
		filtered.push(end);
		highlighted.push(end);
	}

	return {
		filtered: filtered.join(''),
		highlighted: highlighted.join('')
	};
}
