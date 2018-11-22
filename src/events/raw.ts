import { Event } from '../index';

export default class extends Event {

	run(data) {
		this.client.rawEvents.run(data);
	}

};
