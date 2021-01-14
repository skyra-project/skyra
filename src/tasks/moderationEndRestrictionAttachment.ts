import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationData, ModerationTask } from '#lib/structures/moderation/ModerationTask';
import { CLIENT_ID } from '#root/config';
import { Guild, Permissions } from 'discord.js';

export default class extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.me === null ? await guild.members.fetch(CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return null;

		const t = await guild.fetchT();
		await guild.security.actions.unRestrictAttachment(
			{
				moderatorID: CLIENT_ID,
				userID: data.userID,
				reason: `[MODERATION] Attachment Restricted released after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`
			},
			await this.getTargetDM(guild, await this.client.users.fetch(data.userID))
		);
		return null;
	}
}
