import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { MessageEmbed, User } from 'discord.js';
import { Event, Language, LanguageKeysComplex, LanguageKeysSimple } from 'klasa';

export default class extends Event {
	public run(previous: User, next: User) {
		const prevUsername = previous.username;
		const nextUserName = next.username;
		if (prevUsername === nextUserName) return;

		for (const guild of this.client.guilds.cache.values()) {
			if (!guild.members.cache.has(next.id)) continue;

			if (guild.settings.get(GuildSettings.Events.MemberNicknameUpdate)) {
				// Send the Username log
				this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () =>
					this.buildEmbed(next, guild.language, 'eventsNameDifference', 'eventsUsernameUpdate', {
						previous: prevUsername,
						next: nextUserName
					})
				);
			}
		}
	}

	private buildEmbed(user: User, i18n: Language, descriptionKey: LanguageKeysComplex, footerKey: LanguageKeysSimple, value: any) {
		return new MessageEmbed()
			.setColor(Colors.Yellow)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(i18n.get(descriptionKey, value))
			.setFooter(i18n.get(footerKey))
			.setTimestamp();
	}
}
