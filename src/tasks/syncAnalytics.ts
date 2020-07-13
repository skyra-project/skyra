import { Task } from 'klasa';
import { Events } from '@lib/types/Enums';

export default class extends Task {

	public run() {
		return this.client.emit(Events.AnalyticsSync);
	}

}
