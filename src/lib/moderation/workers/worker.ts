import { remove as removeConfusables } from 'confusables';
import { isMainThread, parentPort } from 'node:worker_threads';
import { IncomingPayload, IncomingRunRegExpPayload, IncomingType, OutgoingPayload, OutgoingType } from './types';

if (isMainThread || parentPort === null) throw new Error('The Worker may only be ran via the worker_threads fork method!');

function post(message: OutgoingPayload) {
	return parentPort!.postMessage(message);
}

post({ type: OutgoingType.Heartbeat });

setInterval(() => post({ type: OutgoingType.Heartbeat }), 45000).unref();

parentPort.on('message', (message: IncomingPayload) => post(handleMessage(message)));

function handleMessage(message: IncomingPayload): OutgoingPayload {
	switch (message.type) {
		case IncomingType.RunRegExp:
			return handleRunRegExp(message);
		default:
			return { id: message.id, type: OutgoingType.UnknownCommand };
	}
}

function handleRunRegExp(message: IncomingRunRegExpPayload): OutgoingPayload {
	// Remove confusables and run filter:
	const result = filter(removeConfusables(message.content), message.regExp);
	if (result === null) return { id: message.id, type: OutgoingType.NoContent };

	// Post the results:
	return { id: message.id, type: OutgoingType.RegExpMatch, filtered: result.filtered, highlighted: result.highlighted };
}

function filter(str: string, regex: RegExp) {
	const matches = str.match(regex);
	if (matches === null) return null;

	let last = 0;
	let next = 0;

	const filtered: string[] = [];
	const highlighted: string[] = [];
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
