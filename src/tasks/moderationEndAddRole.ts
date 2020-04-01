import { ModerationData, ModerationTask } from '@lib/structures/ModerationTask';
import { CLIENT_ID } from '@root/config';
import { Guild, Permissions, Role } from 'discord.js';

export default class extends ModerationTask {

	protected async handle(guild: Guild, data: ModerationData<{ role: Role }>) {
		const me = guild.me === null ? await guild.members.fetch(CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return null;
		await guild.security.actions.removeRole({
			moderator_id: CLIENT_ID,
			user_id: data.userID,
			reason: `[MODERATION] Role removed after ${this.client.languages.default.duration(data.duration)}`
		}, data.extraData.role, this.getTargetDM(guild, await this.client.users.fetch(data.userID)));
		return null;
	}

}
