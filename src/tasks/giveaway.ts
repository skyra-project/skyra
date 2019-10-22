// This task will be created by the gschedule command when a user schedules a giveaway to be created.
import { Task } from 'klasa';
import { GiveawayCreateData } from '../lib/structures/Giveaway';

export default class extends Task {

	public run(data: GiveawayCreateData) {
		return this.client.giveaways.create(data);
	}

}

