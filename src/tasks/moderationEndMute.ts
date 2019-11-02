import { ModerationTask, ModerationData } from '../lib/structures/ModerationTask';
import { Guild } from 'discord.js';

export default class extends ModerationTask {

	protected async handle(guild: Guild, data: ModerationData) {
		await guild.security.actions.unMute({
			user_id: data.userID,
			reason: `[MODERATION] Mute released after ${this.client.languages.default.duration(data.duration)}`
		}, this.getTargetDM(guild, await this.client.users.fetch(data.userID)));
		return null;
	}

}
