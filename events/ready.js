const { structures: { Event } } = require('../index');

module.exports = class extends Event {

	run() {
		this.client.user.setActivity('Skyra, help', { type: 2 })
			.catch(err => this.client.emit('log', err, 'error'));
	}

};
