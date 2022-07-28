import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationData, ModerationTask } from '#lib/moderation';
import { getSecurity } from '#utils/functions';
import { fetchT } from '@sapphire/plugin-i18next';
import { Guild, Permissions, Role } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData<{ role: Role }>) {
		const me = guild.me === null ? await guild.members.fetch(process.env.CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return null;

		const t = await fetchT(guild);
		await getSecurity(guild).actions.unAddRole(
			{
				moderatorId: process.env.CLIENT_ID,
				userId: data.userID,
				reason: `[MODERATION] Role removed after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`
			},
			data.extraData.role,
			await this.getTargetDM(guild, await this.container.client.users.fetch(data.userID))
		);
		return null;
	}
}
