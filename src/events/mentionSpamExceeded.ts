import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { Moderation } from '#utils/constants';
import { Event } from '@sapphire/framework';

export class UserEvent extends Event {
	public async run(message: GuildMessage) {
		const [threshold, nms, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Selfmod.NoMentionSpam.MentionsAllowed],
			settings.nms,
			settings.getLanguage()
		]);

		const lock = message.guild.moderation.createLock();
		try {
			await message.guild.members
				.ban(message.author.id, { days: 0, reason: t(LanguageKeys.Events.NoMentionSpam.Footer) })
				.catch((error) => this.context.client.emit(Events.ApiError, error));
			await message.channel
				.send(t(LanguageKeys.Events.NoMentionSpam.Message, { user: message.author }))
				.catch((error) => this.context.client.emit(Events.ApiError, error));
			nms.delete(message.author.id);

			const reason = t(LanguageKeys.Events.NoMentionSpam.ModerationLog, { threshold });
			await message.guild.moderation
				.create({
					userID: message.author.id,
					moderatorID: process.env.CLIENT_ID,
					type: Moderation.TypeCodes.Ban,
					reason
				})
				.create();
		} finally {
			lock();
		}
	}
}
