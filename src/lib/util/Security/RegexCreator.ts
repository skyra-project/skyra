export const kWordStartBoundary = String.raw`(?<=^|\W)`;
export const kWordEndBoundary = String.raw`(?=$|\W)`;
export const kWordBoundaryWildcard = '*';
export const kWordReplacer = /.(?=(.)?)/g;
export const kRegExpSymbols = /[-/\\^$*+?.()|[\]{}]/;

export const enum WordBoundary {
	None,
	Start,
	End,
	Both
}

export function create(words: readonly string[]) {
	const noBoundArray: string[] = [];
	const startBoundArray: string[] = [];
	const endBoundArray: string[] = [];
	const bothBoundArray: string[] = [];

	for (const word of words) {
		const boundaries = processWordBoundaries(word);
		switch (boundaries) {
			case WordBoundary.None:
				noBoundArray.push(processWordPattern(word));
				break;
			case WordBoundary.Start:
				startBoundArray.push(processWordPattern(word.slice(1)));
				break;
			case WordBoundary.End:
				endBoundArray.push(processWordPattern(word.slice(0, -1)));
				break;
			case WordBoundary.Both:
				bothBoundArray.push(processWordPattern(word.slice(1, -1)));
				break;
		}
	}

	const patterns: string[] = [];
	if (noBoundArray.length !== 0) patterns.push(`${kWordStartBoundary}(?:${noBoundArray.join('|')})${kWordEndBoundary}`);
	if (startBoundArray.length !== 0) patterns.push(`(?:${startBoundArray.join('|')})${kWordEndBoundary}`);
	if (endBoundArray.length !== 0) patterns.push(`${kWordStartBoundary}(?:${endBoundArray.join('|')})`);
	if (bothBoundArray.length !== 0) patterns.push(`(?:${bothBoundArray.join('|')})`);

	return patterns.join('|');
}

export function processWordBoundaries(word: string) {
	const starts = word.startsWith(kWordBoundaryWildcard);
	const ends = word.endsWith(kWordBoundaryWildcard);

	return starts
		// Starts and end?
		? ends
			// Starts and ends
			? WordBoundary.Both
			// Only starts
			: WordBoundary.Start
		// Ends?
		: ends
			// Ends with wildcard
			? WordBoundary.End
			// Does not have wildcards
			: WordBoundary.None;
}

export function processWordPattern(word: string) {
	return word.replace(kWordReplacer, (letter, nextWord) => `${processLetter(letter)}+${nextWord ? '\\W*' : ''}`);
}

export function processLetter(letter: string) {
	return kRegExpSymbols.test(letter) ? `\\${letter}` : letter;
}
