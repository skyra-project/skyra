import { Event } from '../index';

export default class extends Event {

	run(err) {
		this.client.console.error(`Disconnected | ${err.code}: ${err.reason}`);
	}

};
