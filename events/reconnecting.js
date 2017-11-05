const { structures: { Event } } = require('../index');

module.exports = class extends Event {

	run() {
		this.client.emit('log', 'Reconnecting...', 'info');
	}

};
