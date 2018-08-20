const { util: { regExpEsc, codeBlock } } = require('klasa');
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

	async run(msg, query) {
		const lowcquery = query.toLowerCase();
		const apResults = [];
		const exResults = [];
		const regExpSrc = new RegExp(regExpEsc(lowcquery));

		let lowerCaseName, distance = 2;
		for (const entry of this.collection.values()) {
			if (!this.filter(entry)) continue;
			lowerCaseName = this.access(entry).toLowerCase();
			if (lowerCaseName === lowcquery) {
				apResults.push(entry);
				exResults.push(entry);
			} else if (regExpSrc.test(lowerCaseName) || ((distance = levenshtein(lowcquery, lowerCaseName, false)) !== -1)) {
				apResults.push(entry);
				if (distance <= 1) {
					exResults.push(entry);
					distance = 2;
				}
			} else {
				continue;
			}

			if (apResults.length === 10) break;
		}

		const results = exResults.length ? exResults : apResults;
		switch (results.length) {
			case 0: return null;
			case 1: return results[0];
			// Two or more
			default: {
				const number = await msg.prompt(msg.language.get('FUZZYSEARCH_MATCHES', results.length - 1,
					codeBlock('http', results.map((result, i) => `${i} : ${this.access(result)} [${result.id}]`).join('\n'))));
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
