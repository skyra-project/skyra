import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationData, ModerationTask } from '#lib/moderation';
import { getSecurity } from '#utils/functions';
import { fetchT } from '@sapphire/plugin-i18next';
import { Guild, Permissions } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		const me = guild.me === null ? await guild.members.fetch(process.env.CLIENT_ID) : guild.me;
		if (!me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return null;

		const t = await fetchT(guild);
		await getSecurity(guild).actions.unBan(
			{
				moderatorId: process.env.CLIENT_ID,
				userId: data.userID,
				reason: `[MODERATION] Ban released after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`
			},
			await this.getTargetDM(guild, await this.container.client.users.fetch(data.userID))
		);
		return null;
	}
}
