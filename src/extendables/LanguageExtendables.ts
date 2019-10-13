import { Extendable, ExtendableStore, Language, LanguageStore } from 'klasa';
import { LanguageKeysSimple, LanguageKeysComplex } from '../lib/types/Augments';
import { LanguageKeys } from '../lib/types/Languages';

export default class extends Extendable {

	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Language] });
	}

	public tget<T extends LanguageKeysSimple>(term: T): LanguageKeys[T];
	public tget<T extends LanguageKeysComplex>(term: T, ...args: Parameters<LanguageKeys[T]>): ReturnType<LanguageKeys[T]>
	public tget(this: Language, key: string, ...args: readonly unknown[]): unknown {
		return this.get(key, ...args);
	}

	public retrieve(this: Language, key: string) {
		const value = this.language[key];
		if (value) return value;

		const deft = (this.store as unknown as LanguageStore).default;
		return (this !== deft && deft.language[key]) || null;
	}

}
