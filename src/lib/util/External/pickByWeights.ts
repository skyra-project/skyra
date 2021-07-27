import { isNumber } from '@sapphire/utilities';

export function pickByWeights(entries: Map<string, number>) {
	const sum = sumValues(entries);
	const chosen = Math.floor(Math.random() * sum);

	let accumulated = 0;
	for (const [key, value] of entries.entries()) {
		accumulated += value;
		if (accumulated > chosen) {
			return key;
		}
	}

	return null;
}

function sumValues(entries: Map<string, number>) {
	let output = 0;
	for (const value of entries.values()) output += value;
	if (isNumber(output)) return output;
	throw new TypeError('The resulting values did not yield a valid number.');
}
