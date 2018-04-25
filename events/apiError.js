const { Event } = require('../index');
const { DiscordAPIError } = require('discord.js');

module.exports = class extends Event {

	run(error) {
		if (error instanceof DiscordAPIError) {
			this.client.console.warn(
				`[API ERROR] [CODE: ${error.code}] ${error.message}` +
				`            [PATH: ${error.path}]`
			);
			this.client.console.wtf(error.stack);
		} else {
			this.client.emit('wtf', error);
		}
	}

};
