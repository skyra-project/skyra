const { Event } = require('../index');

module.exports = class extends Event {

	run(data) {
		this.client.rawEvents.run(data);
	}

};
