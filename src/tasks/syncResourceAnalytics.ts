import { Events } from '#lib/types/Enums';
import { Task } from '#lib/database';

export default class extends Task {
	public run() {
		this.client.emit(Events.ResourceAnalyticsSync);
		return null;
	}
}
