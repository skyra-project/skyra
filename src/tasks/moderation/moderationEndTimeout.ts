import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationTask, type ModerationData } from '#lib/moderation';
import { getModeration } from '#utils/functions';
import { TypeMetadata, TypeVariation } from '#utils/moderationConstants';
import { fetchT } from '@sapphire/plugin-i18next';
import type { Guild } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData) {
		const t = await fetchT(guild);

		const moderation = getModeration(guild);

		const reason = `[MODERATION] Timeout released after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`;
		const entry = moderation.create({
			user: data.userID,
			type: TypeVariation.Timeout,
			metadata: TypeMetadata.Undo,
			reason
		});
		await moderation.insert(entry);
		return null;
	}
}
