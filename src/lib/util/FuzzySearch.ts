import { util } from 'klasa';
import { SkyraMessage } from '../types/klasa';
import levenshtein from './External/levenshtein';
const { codeBlock } = util;

class FuzzySearch<K extends string, V, C extends Map<K, V>> {

	public constructor(collection: C, access: (entry: V) => string, filter: (entry: V) => boolean = (entry: V): boolean => !!entry) {
		this.collection = collection;
		this.filter = filter;
		this.access = access;
	}

	public collection: C;
	public filter: (entry: V) => boolean;
	public access: (entry: V) => string;

	public run(msg: SkyraMessage, query: string): Promise<[K, V] | null> {
		const lowcquery: string = query.toLowerCase();
		const apResults: [K, V][] = [];
		const exResults: [K, V][] = [];

		let lowerCaseName: string, current: string, distance: number = 2;
		for (const [id, entry] of this.collection.entries()) {
			if (!this.filter(entry)) continue;
			current = this.access(entry);
			if (typeof current !== 'string') continue;
			lowerCaseName = current.toLowerCase();
			if (lowerCaseName === lowcquery) {
				const resolved: [K, V] = [id, entry];
				apResults.push(resolved);
				exResults.push(resolved);
			} else if (lowerCaseName.includes(lowcquery) || ((distance = levenshtein(lowcquery, lowerCaseName, false)) !== -1)) {
				const resolved: [K, V] = [id, entry];
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

	public async select(msg: SkyraMessage, results: [K, V][]): Promise<[K, V] | null> {
		switch (results.length) {
			case 0: return null;
			case 1: return results[0];
			// Two or more
			default: {
				const { content: n } = await msg.prompt(msg.language.get('FUZZYSEARCH_MATCHES', results.length - 1,
					codeBlock('http', results.map(([id, result], i) => `${i} : [ ${id.padEnd(18, ' ')} ] ${this.access(result)}`).join('\n'))));
				if (n.toLowerCase() === 'abort') return null;
				const parsed: number = Number(n);
				if (!Number.isSafeInteger(parsed)) throw msg.language.get('FUZZYSEARCH_INVALID_NUMBER');
				if (parsed < 0 || parsed >= results.length) throw msg.language.get('FUZZYSEARCH_INVALID_INDEX');
				return results[parsed];
			}
		}
	}

}

export default FuzzySearch;
