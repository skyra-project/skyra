import { Permissions, Guild } from 'discord.js';
import { ModerationTask, ModerationData } from '../lib/structures/ModerationTask';
import { CLIENT_ID } from '../../config';

export default class extends ModerationTask {

	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.me === null ? await guild.members.fetch(CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return null;
		await guild.security.actions.unWarning({
			user_id: data.userID,
			reason: `[MODERATION] Warning released after ${this.client.languages.default.duration(data.duration)}`
		}, data.caseID, this.getTargetDM(guild, await this.client.users.fetch(data.userID)));
		return null;
	}

}
