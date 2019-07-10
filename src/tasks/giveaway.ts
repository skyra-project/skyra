// This task will be created by the gschedule command when a user schedules a giveaway to be created.
import { Task } from 'klasa';
import { GiveawayCreateData } from '../lib/structures/Giveaway';

export default class extends Task {

	public async run(data: GiveawayCreateData): Promise<any> {
		return this.client.giveaways.create(data);
	}

}

