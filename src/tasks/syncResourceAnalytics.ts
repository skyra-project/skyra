import { Task } from '#lib/database';
import { Events } from '#lib/types/Enums';

export class UserTask extends Task {
	public run() {
		this.context.client.emit(Events.ResourceAnalyticsSync);
		return null;
	}
}
