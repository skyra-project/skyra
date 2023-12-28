import { Task } from '#lib/database';
import { Events } from '#lib/types';

export class UserTask extends Task {
	public run() {
		this.container.client.emit(Events.ResourceAnalyticsSync);
		return null;
	}
}
