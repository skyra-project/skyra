import { Events } from '@lib/types/Enums';
import { Task } from 'klasa';

export default class extends Task {
	public run() {
		return this.client.emit(Events.ResourceAnalyticsSync);
	}
}
