import { Extendable, ExtendableStore, KlasaClient, Language, LanguageStore } from 'klasa';

export default class extends Extendable {

	public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [Language] });
	}

	public retrieve(key: string) {
		const self = this as unknown as Language;
		const value = self.language[key];
		if (value) return value;

		const deft = (self.store as unknown as LanguageStore).default;
		return (self !== deft && deft.language[key]) || null;
	}

}
