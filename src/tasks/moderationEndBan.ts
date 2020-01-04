import { Permissions, Guild } from 'discord.js';
import { ModerationTask, ModerationData } from '@lib/structures/ModerationTask';
import { CLIENT_ID } from '@root/config';

export default class extends ModerationTask {

	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.me === null ? await guild.members.fetch(CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return null;
		await guild.security.actions.unBan({
			user_id: data.userID,
			reason: `[MODERATION] Ban released after ${this.client.languages.default.duration(data.duration)}`
		}, this.getTargetDM(guild, await this.client.users.fetch(data.userID)));
		return null;
	}

}
