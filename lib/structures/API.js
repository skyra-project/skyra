const { Piece } = require('klasa');

class API {

	constructor(client, dir, file, options = {}) {
		this.client = client;
		this.dir = dir;
		this.file = file;
		this.name = options.name || dir.join('/').slice(0, -3);
		this.type = 'api';
		this.enabled = 'enabled' in options ? options.enabled : true;
	}

	run() {
		// Defined in extension Classes
	}

	async init() {
		// Optionally defined in extension Classes
	}

	// Technically left for more than just documentation
	/* eslint-disable no-empty-function */
	async reload() { }
	unload() { }
	disable() { }
	enable() { }
	/* eslint-enable no-empty-function */

}

Piece.applyToClass(API);

module.exports = API;
