import { Event } from '../index';

export default class extends Event {

	run() {
		this.client.console.warn('Reconnecting...');
	}

};
