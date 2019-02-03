import { Client } from 'discord.js';
import { ExtendableStore, Language, LanguageStore } from 'klasa';

export default class extends Extendable {

	public constructor(client: Client, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [Language] });
	}

	public retrieve(key: string) {
		const self = this as Language;
		const value = self.language[key];
		if (value) return value;

		const deft = (self.store as LanguageStore).default;
		return (self !== deft && deft.language[key]) || null;
	}

}
