const { Event } = require('../index');

module.exports = class extends Event {

	run(data, type = 'log') {
		return this.client.console.log(data, type);
	}

};
