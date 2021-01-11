import { GuildSettings } from '#lib/database';
import { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '#root/config';
import { Moderation } from '#utils/constants';
import { Event } from 'klasa';

export default class extends Event {
	public async run(message: GuildMessage) {
		const [threshold, nms, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Selfmod.NoMentionSpam.MentionsAllowed],
			settings.nms,
			settings.getLanguage()
		]);

		const lock = message.guild.moderation.createLock();
		try {
			await message.guild.members
				.ban(message.author.id, { days: 0, reason: t(LanguageKeys.Monitors.NoMentionSpamFooter) })
				.catch((error) => this.client.emit(Events.ApiError, error));
			await message.channel
				.sendTranslated(LanguageKeys.Monitors.NoMentionSpamMessage, [{ user: message.author }])
				.catch((error) => this.client.emit(Events.ApiError, error));
			nms.delete(message.author.id);

			const reason = t(LanguageKeys.Monitors.NoMentionSpamModerationLog, { threshold });
			await message.guild.moderation
				.create({
					userID: message.author.id,
					moderatorID: CLIENT_ID,
					type: Moderation.TypeCodes.Ban,
					reason
				})
				.create();
		} finally {
			lock();
		}
	}
}
