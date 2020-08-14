import { ModerationData, ModerationTask } from '@lib/structures/ModerationTask';
import { CLIENT_ID } from '@root/config';
import { Guild } from 'discord.js';

export default class extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		await guild.security.actions.unMute(
			{
				moderatorID: CLIENT_ID,
				userID: data.userID,
				reason: `[MODERATION] Mute released after ${this.client.languages.default.duration(data.duration)}`
			},
			await this.getTargetDM(guild, await this.client.users.fetch(data.userID))
		);
		return null;
	}
}
