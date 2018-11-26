import { Event } from 'klasa';

export default class extends Event {

	public run(): void {
		this.client.console.warn('Reconnecting...');
	}

}
