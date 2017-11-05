const { structures: { Event } } = require('../index');

module.exports = class extends Event {

	run() {
		return this.client.console.log('Reconnecting...', 'info');
	}

};
