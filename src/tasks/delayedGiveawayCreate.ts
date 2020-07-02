// This task will be created by the gschedule command when a user schedules a giveaway to be created.
import type { GiveawayCreateData } from '@lib/structures/managers/GiveawayManager';
import { PartialResponseValue, ResponseType } from '@orm/entities/ScheduleEntity';
import { Task } from 'klasa';

export default class extends Task {

	public async run(data: GiveawayCreateData): Promise<PartialResponseValue> {
		await this.client.giveaways.create(data);
		return { type: ResponseType.Finished };
	}

}
