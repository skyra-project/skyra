// @ts-nocheck
const { Extendable, Language } = require('../index');

export default class extends Extendable {

	public constructor(client: Skyra, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [Language] });
	}

	public fetch(keyname) {
		return this.language[keyname] || this.store.default.language[keyname] || null;
	}

}
