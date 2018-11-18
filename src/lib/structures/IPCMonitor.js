const { Piece } = require('klasa');

class IPCMonitor extends Piece {

	/**
	 * @param {Object} data The data from the message
	 * @abstract
	 */
	async run(data) { // eslint-disable-line no-unused-vars
		// Defined in extension Classes
	}

	async init() {
		// Optionally defined in extension Classes
	}

}

module.exports = IPCMonitor;
