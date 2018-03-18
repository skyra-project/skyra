const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			name: 'fetch',
			appliesTo: ['Language'],
			klasa: true
		});
	}

	extend(keyname) {
		return this.language[keyname] || this.store.default.language[keyname] || null;
	}

};
