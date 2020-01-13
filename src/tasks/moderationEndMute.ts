import { ModerationData, ModerationTask } from '@lib/structures/ModerationTask';
import { Guild } from 'discord.js';
import { CLIENT_ID } from '@root/config';

export default class extends ModerationTask {

	protected async handle(guild: Guild, data: ModerationData) {
		await guild.security.actions.unMute({
			moderator_id: CLIENT_ID,
			user_id: data.userID,
			reason: `[MODERATION] Mute released after ${this.client.languages.default.duration(data.duration)}`
		}, this.getTargetDM(guild, await this.client.users.fetch(data.userID)));
		return null;
	}

}
