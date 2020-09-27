import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CustomGet } from '@lib/types/Shared';
import { MessageLogsEnum } from '@utils/constants';
import { MessageEmbed, User } from 'discord.js';
import { Event, Language } from 'klasa';

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
					this.buildEmbed(
						next,
						guild.language,
						this.getNameDescription(guild.language, prevUsername, nextUserName),
						LanguageKeys.Events.UsernameUpdate
					)
				);
			}
		}
	}

	private getNameDescription(i18n: Language, previousName: string | null, nextName: string | null) {
		const previous = previousName === null ? LanguageKeys.Events.NameUpdatePreviousWasNotSet : LanguageKeys.Events.NameUpdatePreviousWasSet;
		const next = nextName === null ? LanguageKeys.Events.NameUpdateNextWasNotSet : LanguageKeys.Events.NameUpdateNextWasSet;
		return [i18n.get(previous, { previousName }), i18n.get(next, { nextName })].join('\n');
	}

	private buildEmbed(user: User, i18n: Language, description: string, footerKey: CustomGet<string, string>) {
		return new MessageEmbed()
			.setColor(Colors.Yellow)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(description)
			.setFooter(i18n.get(footerKey))
			.setTimestamp();
	}
}
