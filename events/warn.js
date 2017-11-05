const { structures: { Event } } = require('../index');

module.exports = class extends Event {

	run(info) {
		this.client.emit('log', info, 'warn');
	}

};
