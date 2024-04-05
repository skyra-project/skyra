import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events, type GuildMessage } from '#lib/types';
import { getModeration } from '#utils/functions';
import { TypeVariation } from '#utils/moderationConstants';
import { getTag } from '#utils/util';
import { Listener } from '@sapphire/framework';

export class UserListener extends Listener {
	public async run(message: GuildMessage) {
		const [threshold, nms, t] = await readSettings(message.guild, (settings) => [
			settings[GuildSettings.AutoModeration.NoMentionSpam.MentionsAllowed],
			settings.nms,
			settings.getLanguage()
		]);

		const moderation = getModeration(message.guild);
		const lock = moderation.createLock();
		try {
			await message.guild.members
				.ban(message.author.id, { deleteMessageSeconds: 0, reason: t(LanguageKeys.Events.NoMentionSpam.Footer) })
				.catch((error) => this.container.client.emit(Events.Error, error));
			await message.channel
				.send(t(LanguageKeys.Events.NoMentionSpam.Message, { userId: message.author.id, userTag: getTag(message.author) }))
				.catch((error) => this.container.client.emit(Events.Error, error));
			nms.delete(message.author.id);

			const reason = t(LanguageKeys.Events.NoMentionSpam.ModerationLog, { threshold });
			await moderation.insert(moderation.create({ user: message.author.id, type: TypeVariation.Ban, reason }));
		} finally {
			lock();
		}
	}
}
