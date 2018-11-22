import { util : { codeBlock }; } from; 'klasa';
import levenshtein from './External/levenshtein';

class FuzzySearch {

	public constructor(collection, access, filter = () => true) {
		this.collection = collection;

		/**
		 * @type {function(object):boolean}
		 */
		this.filter = filter;

		/**
		 * @type {function(object):string}
		 */
		this.access = access;
	}

	public run(message, query) {
		const lowcquery = query.toLowerCase();
		const results = [];

		let lowerCaseName, current, distance;
		let almostExacts = 0;
		for (const [id, entry] of this.collection.entries()) {
			if (!this.filter(entry)) continue;

			current = this.access(entry);
			lowerCaseName = current.toLowerCase();

			// If lowercase result, go next
			if (lowerCaseName === lowcquery)
				distance = 0;
			else if (lowerCaseName.includes(lowcquery))
				distance = lowerCaseName.length - lowcquery.length;
			else
				distance = levenshtein(lowcquery, lowerCaseName, false);

			if (distance === -1) continue;

			// Push the results
			results.push([id, entry, distance]);

			// Continue earlier
			if (distance <= 1) almostExacts++;
			if (almostExacts === 10) break;
		}

		if (!results.length) return null;

		// Almost precisive matches
		const sorted = results.sort((a, b) => a[2] - b[2]);
		const precision = sorted[0][2];
		if (precision <= 2) {
			let i = 0;
			while (i < results.length && i === precision) i++;
			return this.select(message, i === results.length ? results : results.slice(0, i));
		}

		return this.select(message, results);
	}

	public async select(message, results) {
		switch (results.length) {
			case 0: return null;
			case 1: return results[0];
			// Two or more
			default: {
				const { content: number } = await message.prompt(message.language.get('FUZZYSEARCH_MATCHES', results.length - 1,
					codeBlock('http', results.map(([id, result], i) => `${i} : [ ${id.padEnd(18, ' ')} ] ${this.access(result)}`).join('\n'))));
				if (number.toLowerCase() === 'abort') return null;
				const parsed = Number(number);
				if (!Number.isSafeInteger(parsed)) throw message.language.get('FUZZYSEARCH_INVALID_NUMBER');
				if (parsed < 0 || parsed >= results.length) throw message.language.get('FUZZYSEARCH_INVALID_INDEX');
				return results[parsed];
			}
		}
	}

}

export FuzzySearch;
