const { Event, DiscordAPIError, HTTPError } = require('../index');

module.exports = class extends Event {

	run(error) {
		if (error instanceof DiscordAPIError) {
			this.client.console.warn(
				`[API ERROR] [CODE: ${error.code}] ${error.message}\n` +
				`            [PATH: ${error.method} ${error.path}]`
			);
			this.client.console.wtf(error.stack);
		} else if (error instanceof HTTPError) {
			this.client.console.warn(
				`[HTTP ERROR] [CODE: ${error.code}] ${error.message}\n` +
				`             [PATH: ${error.method} ${error.path}]`
			);
			this.client.console.wtf(error.stack);
		} else {
			this.client.emit('wtf', error);
		}
	}

};
