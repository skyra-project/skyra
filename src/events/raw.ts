import { Event } from 'klasa';

export default class extends Event {

	public run(data: any): void {
		this.client.rawEvents.run(data);
	}

}
