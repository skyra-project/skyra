import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationData, ModerationTask } from '#lib/moderation';
import { Guild, Permissions } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.me === null ? await guild.members.fetch(process.env.CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return null;

		const t = await guild.fetchT();
		await guild.security.actions.unRestrictReaction(
			{
				moderatorID: process.env.CLIENT_ID,
				userID: data.userID,
				reason: `[MODERATION] Reaction Restricted released after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`
			},
			await this.getTargetDM(guild, await this.context.client.users.fetch(data.userID))
		);
		return null;
	}
}
