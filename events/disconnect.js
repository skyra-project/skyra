const { Event } = require('../index');

module.exports = class extends Event {

	run(err) {
		this.client.emit('log', `Disconnected | ${err.code}: ${err.reason}`, 'error');
	}

};
