import { Event } from 'klasa';

export default class extends Event {
	public run() {
		this.client.console.warn('Reconnecting...');
	}
}
