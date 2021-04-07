import { TimerManager } from '@sapphire/time-utilities';
import { remove as removeConfusables } from 'confusables';
import { isMainThread, parentPort } from 'worker_threads';
import { IncomingPayload, IncomingType, OutgoingPayload, OutgoingType } from './types';

if (isMainThread || parentPort === null) throw new Error('The Worker may only be ran via the worker_threads fork method!');

function post(message: OutgoingPayload) {
	return parentPort!.postMessage(message);
}

post({ type: OutgoingType.Heartbeat });

TimerManager.setInterval(() => {
	post({ type: OutgoingType.Heartbeat });
}, 45000);

const guildRegExpCache = new Map<string, RegExp>();

parentPort.on('message', (message: IncomingPayload) => {
	switch (message.type) {
		case IncomingType.UpdateGuildRegExp: {
			// If the RegExp was null, delete entry from cache, else set it:
			if (message.data === null) guildRegExpCache.delete(message.guildID);
			else guildRegExpCache.set(message.guildID, message.data);
			break;
		}
		case IncomingType.RunGuildRegExp: {
			// If there was no value in cache, skip as it indicates the guild has no RegExp:
			const value = guildRegExpCache.get(message.guildID);
			if (value === undefined) break;

			// Remove confusables and run filter:
			const result = filter(removeConfusables(message.content), value);
			if (result === null) break;

			// Post the results:
			post({ id: message.id, type: OutgoingType.RegExpMatch, filtered: result.filtered, highlighted: result.highlighted });
			return;
		}
	}

	// Always send NoContent unless returned otherwise:
	post({ id: message.id, type: OutgoingType.NoContent });
});

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
