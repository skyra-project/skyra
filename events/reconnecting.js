const { Event } = require('../index');

module.exports = class extends Event {

	run() {
		this.client.console.warn('Reconnecting...');
	}

};
