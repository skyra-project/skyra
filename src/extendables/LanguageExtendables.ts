// @ts-nocheck
import { Client } from 'discord.js';
import { ExtendableStore, Language } from 'klasa';

export default class extends Extendable {

	public constructor(client: Client, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [Language] });
	}

	public retrieve(key: string): any {
		return this.language[key] || this.store.default.language[key] || null;
	}

}

declare module 'klasa' {
	export interface Language {
		retrieve(key: string): any;
	}
}
