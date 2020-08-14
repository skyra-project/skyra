import { ModerationData, ModerationTask } from '@lib/structures/ModerationTask';
import { CLIENT_ID } from '@root/config';
import { Guild, Permissions } from 'discord.js';

export default class extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.me === null ? await guild.members.fetch(CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)) return null;
		await guild.security.actions.unVoiceMute(
			{
				moderatorID: CLIENT_ID,
				userID: data.userID,
				reason: `[MODERATION] Voice Mute released after ${this.client.languages.default.duration(data.duration)}`
			},
			await this.getTargetDM(guild, await this.client.users.fetch(data.userID))
		);
		return null;
	}
}
