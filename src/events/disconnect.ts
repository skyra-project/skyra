const { Event } = require('../index');

module.exports = class extends Event {

	public run(err) {
		this.client.console.error(`Disconnected | ${err.code}: ${err.reason}`);
	}

};
