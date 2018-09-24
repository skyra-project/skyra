const { Event } = require('../index');

module.exports = class extends Event {

	public run(messages) {
		for (const message of messages.values()) if (message.command) for (const msg of message.responses) msg.nuke();
	}

};
