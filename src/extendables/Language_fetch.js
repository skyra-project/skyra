// @ts-nocheck
const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			name: 'fetch',
			appliesTo: ['Language'],
			klasa: true
		});
	}

	extend(keyname) {
		return this.language[keyname] || this.store.default.language[keyname] || null;
	}

};
