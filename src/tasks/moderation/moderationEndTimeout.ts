import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationTask, type ModerationData } from '#lib/moderation';
import { getSecurity } from '#utils/functions';
import { fetchT } from '@sapphire/plugin-i18next';
import type { Guild } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		const t = await fetchT(guild);
		await getSecurity(guild).actions.timeout(
			{
				moderatorId: this.container.client.id!,
				userId: data.userID,
				reason: `[MODERATION] Timeout released after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`
			},
			data.caseID,
			await this.getTargetDM(guild, await this.container.client.users.fetch(data.userID))
		);
		return null;
	}
}
