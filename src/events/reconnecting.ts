const { Event } = require('../index');

module.exports = class extends Event {

	public run() {
		this.client.console.warn('Reconnecting...');
	}

};
