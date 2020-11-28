// This task will be created by the gschedule command when a user schedules a giveaway to be created.
import { PartialResponseValue, ResponseType, Task } from '#lib/database';
import { GiveawayCreateData } from '#lib/structures/managers/GiveawayManager';

export default class extends Task {
	public async run(data: GiveawayCreateData): Promise<PartialResponseValue> {
		await this.client.giveaways.create({ ...data, endsAt: new Date(data.endsAt) });
		return { type: ResponseType.Finished };
	}
}
