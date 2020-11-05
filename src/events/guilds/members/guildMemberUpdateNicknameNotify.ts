import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageLogsEnum } from '@utils/constants';
import { GuildMember, MessageEmbed } from 'discord.js';
import { Event, EventOptions, Language } from 'klasa';

@ApplyOptions<EventOptions>({ name: Events.GuildMemberUpdate })
export default class extends Event {
	public async run(previous: GuildMember, next: GuildMember) {
		const [enabled, language] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Events.MemberNicknameUpdate],
			settings.getLanguage()
		]);
		// Retrieve whether or not nickname logs should be sent from Guild Settings and
		// whether or not the nicknames are identical.
		if (!enabled) return;

		// Send the Nickname log
		const prevNickname = previous.nickname;
		const nextNickname = next.nickname;
		const { user } = next;
		if (prevNickname !== nextNickname) {
			this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, next.guild, () =>
				new MessageEmbed()
					.setColor(Colors.Yellow)
					.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
					.setDescription(this.getNameDescription(language, prevNickname, nextNickname))
					.setFooter(language.get(LanguageKeys.Events.NicknameUpdate))
					.setTimestamp()
			);
		}
	}

	private getNameDescription(i18n: Language, previousName: string | null, nextName: string | null) {
		return [
			i18n.get(previousName === null ? LanguageKeys.Events.NameUpdatePreviousWasNotSet : LanguageKeys.Events.NameUpdatePreviousWasSet, {
				previousName
			}),
			i18n.get(nextName === null ? LanguageKeys.Events.NameUpdateNextWasNotSet : LanguageKeys.Events.NameUpdateNextWasSet, { nextName })
		].join('\n');
	}
}
