import { Task } from 'klasa';
import { Moderation } from '../lib/util/constants';

export default class extends Task {

	public async run(doc: UnmuteTaskData) {
		// Get the guild
		const guild = this.client.guilds.get(doc.guildID);

		if (!guild) return;

		await guild.security.actions.unmute(doc.userID, '[Automatic] Temporary Action Released.');
		await guild.moderation.create({
			user_id: doc.userID,
			moderator_id: this.client.user!.id,
			type: Moderation.TypeCodes.UnMute,
			reason: `Mute released after ${this.client.languages.default.duration(doc.duration)}`
		}).create();
	}

}

interface UnmuteTaskData {
	[Moderation.SchemaKeys.Guild]: string;
	[Moderation.SchemaKeys.User]: string;
	[Moderation.SchemaKeys.Duration]: number;
	[Moderation.SchemaKeys.Case]: number;
}
