import { Task } from 'klasa';
import { Moderation } from '../lib/util/constants';

export default class extends Task {

	public async run(doc: UnmuteTaskData) {
		// Get the guild
		const guild = this.client.guilds.get(doc.guildID);
		if (!guild) return;

		await guild.security.actions.unMute({
			user_id: doc.userID,
			reason: `Mute released after ${this.client.languages.default.duration(doc.duration)}`
		});
	}

}

interface UnmuteTaskData {
	[Moderation.SchemaKeys.Guild]: string;
	[Moderation.SchemaKeys.User]: string;
	[Moderation.SchemaKeys.Duration]: number;
	[Moderation.SchemaKeys.Case]: number;
}
