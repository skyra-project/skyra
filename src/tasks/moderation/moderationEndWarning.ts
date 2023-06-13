import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationData, ModerationTask } from '#lib/moderation';
import { getSecurity } from '#utils/functions';
import { fetchT } from '@sapphire/plugin-i18next';
import { Guild, Permissions } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.members.me ?? (await guild.members.fetch(this.container.client.id!));
		if (!me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return null;

		const t = await fetchT(guild);
		await getSecurity(guild).actions.unWarning(
			{
				moderatorId: process.env.CLIENT_ID,
				userId: data.userID,
				reason: `[MODERATION] Warning released after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`
			},
			data.caseID,
			await this.getTargetDM(guild, await this.container.client.users.fetch(data.userID))
		);
		return null;
	}
}
