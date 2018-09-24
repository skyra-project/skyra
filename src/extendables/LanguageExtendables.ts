// @ts-nocheck
const { Extendable, Language } = require('../index');

module.exports = class extends Extendable {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, { appliesTo: [Language] });
	}

	public fetch(keyname) {
		return this.language[keyname] || this.store.default.language[keyname] || null;
	}

};
