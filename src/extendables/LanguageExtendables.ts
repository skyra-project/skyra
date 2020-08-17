import { Extendable, ExtendableStore, Language, LanguageStore } from 'klasa';

declare type A = Language['language']['UNKNOWN_ROLE'];

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Language] });
	}

	public retrieve(this: Language, key: string) {
		const value = Reflect.get(this.language, key);
		if (value) return value;

		const deft = ((this.store as unknown) as LanguageStore).default;
		return (this !== deft && Reflect.get(deft.language, key)) || null;
	}
}
