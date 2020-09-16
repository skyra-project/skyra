import { cast } from '@utils/util';
import { Extendable, ExtendableStore, Language, LanguageStore } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Language] });
	}

	public retrieve(this: Language, key: string) {
		const languageKey = Reflect.get(this.language, key);
		if (languageKey) return languageKey;

		const deft = cast<LanguageStore>(this.store).default;
		return (this !== deft && Reflect.get(deft.language, key)) || null;
	}
}
