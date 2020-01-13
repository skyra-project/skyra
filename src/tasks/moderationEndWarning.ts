import { ModerationData, ModerationTask } from '@lib/structures/ModerationTask';
import { CLIENT_ID } from '@root/config';
import { Guild, Permissions } from 'discord.js';

export default class extends ModerationTask {

	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.me === null ? await guild.members.fetch(CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return null;
		await guild.security.actions.unWarning({
			moderator_id: CLIENT_ID,
			user_id: data.userID,
			reason: `[MODERATION] Warning released after ${this.client.languages.default.duration(data.duration)}`
		}, data.caseID, this.getTargetDM(guild, await this.client.users.fetch(data.userID)));
		return null;
	}

}
