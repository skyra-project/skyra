const { Event } = require('../index');

module.exports = class extends Event {

	run(messages) {
		for (const message of messages.values()) if (message.command) for (const msg of message.responses) msg.nuke();
	}

};
