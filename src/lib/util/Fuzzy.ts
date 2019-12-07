// TODO(quantumlytangled): Replace with Rust Sonic
import Fuse, { FuseOptions } from 'fuse.js';

export class FuzzyArraySearch<V> {

	private readonly data: V[];
	private readonly fuseOptions?: FuseOptions<V>;

	public constructor(data: V[], keys: (keyof V)[], options?: FuseOptions<V>) {
		this.data = data;
		this.fuseOptions = {
			...options,
			keys,
		};
	}

	public runFuzzy(query: string) {
		const locquery = query.toLowerCase();

		const fuzzyFuse = new Fuse(this.data, this.fuseOptions);

		return fuzzyFuse.search(locquery) as V[];
	}

}
