import { GuildMessage } from '@lib/types';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { Moderation } from '@utils/constants';
import { Event } from 'klasa';

export default class extends Event {
	public async run(message: GuildMessage) {
		const [threshold, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Selfmod.NoMentionSpam.MentionsAllowed],
			settings.getLanguage()
		]);

		const lock = message.guild.moderation.createLock();
		try {
			await message.guild.members
				.ban(message.author.id, { days: 0, reason: language.get(LanguageKeys.Monitors.NmsFooter) })
				.catch((error) => this.client.emit(Events.ApiError, error));
			await message
				.sendLocale(LanguageKeys.Monitors.NmsMessage, [{ user: message.author }])
				.catch((error) => this.client.emit(Events.ApiError, error));
			message.guild.security.nms.delete(message.author.id);

			const reason = language.get(LanguageKeys.Monitors.NmsModlog, { threshold });
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
