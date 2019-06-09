// This task will be created by the gschedule command when a user schedules a giveaway to be created.
import { Task } from 'klasa';

export default class extends Task {

	public async run(doc: any): Promise<any> {
		return this.client.giveaways.create({
			channelID: doc.channelID,
			endsAt: doc.endsAt,
			guildID: doc.guildID,
			minimum: doc.minimum,
			minimumWinners: doc.minimumWinners,
			title: doc.title
		});
	}

}

