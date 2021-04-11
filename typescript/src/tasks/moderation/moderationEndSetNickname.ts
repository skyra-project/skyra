import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationData, ModerationTask } from '#lib/moderation';
import { Guild, Permissions } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData<{ oldName: string }>) {
		const me = guild.me === null ? await guild.members.fetch(process.env.CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) return null;

		const t = await guild.fetchT();
		await guild.security.actions.unSetNickname(
			{
				moderatorID: process.env.CLIENT_ID,
				userID: data.userID,
				reason: `[MODERATION] Nickname reverted after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`
			},
			data.extraData.oldName,
			await this.getTargetDM(guild, await this.context.client.users.fetch(data.userID))
		);
		return null;
	}
}
