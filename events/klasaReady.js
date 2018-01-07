const { Event } = require('klasa');

module.exports = class extends Event {

	run() {
		// this.client.user.setActivity('Skyra, help', { type: 'LISTENING' })
		this.client.user.setActivity('Skyra, help', { type: 'LISTENING' })
			.catch(err => this.client.emit('log', err, 'error'));
	}

};
