import { Event } from '../index';

export default class extends Event {

	run(messages) {
		for (const message of messages.values()) if (message.command) for (const msg of message.responses) msg.nuke();
	}

};
