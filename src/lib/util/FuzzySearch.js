const { util: { codeBlock } } = require('klasa');
const levenshtein = require('./External/levenshtein');

class FuzzySearch {

	constructor(collection, access, filter = () => true) {
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

	run(msg, query) {
		const lowcquery = query.toLowerCase();
		const apResults = [];
		const exResults = [];

		let lowerCaseName, current, distance = 2;
		for (const [id, entry] of this.collection.entries()) {
			if (!this.filter(entry)) continue;
			current = this.access(entry);
			if (typeof current !== 'string') continue;
			lowerCaseName = current.toLowerCase();
			if (lowerCaseName === lowcquery) {
				const resolved = [id, entry];
				apResults.push(resolved);
				exResults.push(resolved);
			} else if (lowerCaseName.includes(lowcquery) || ((distance = levenshtein(lowcquery, lowerCaseName, false)) !== -1)) {
				const resolved = [id, entry];
				apResults.push(resolved);
				if (distance <= 1) {
					exResults.push(resolved);
					distance = 2;
				}
			} else {
				continue;
			}

			if (apResults.length === 10) break;
		}

		return this.select(msg, exResults.length ? exResults : apResults);
	}

	async select(msg, results) {
		switch (results.length) {
			case 0: return null;
			case 1: return results[0];
			// Two or more
			default: {
				const { content: number } = await msg.prompt(msg.language.get('FUZZYSEARCH_MATCHES', results.length - 1,
					codeBlock('http', results.map(([id, result], i) => `${i} : [ ${id.padEnd(18, ' ')} ] ${this.access(result)}`).join('\n'))));
				if (number.toLowerCase() === 'abort') return null;
				const parsed = Number(number);
				if (!Number.isSafeInteger(parsed)) throw msg.language.get('FUZZYSEARCH_INVALID_NUMBER');
				if (parsed < 0 || parsed >= results.length) throw msg.language.get('FUZZYSEARCH_INVALID_INDEX');
				return results[parsed];
			}
		}
	}

}

module.exports = FuzzySearch;
