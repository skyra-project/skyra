import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationData, ModerationTask } from '#lib/moderation';
import type { Guild } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		const t = await guild.fetchT();
		await guild.security.actions.unMute(
			{
				moderatorID: process.env.CLIENT_ID,
				userID: data.userID,
				reason: `[MODERATION] Mute released after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`
			},
			await this.getTargetDM(guild, await this.context.client.users.fetch(data.userID))
		);
		return null;
	}
}
