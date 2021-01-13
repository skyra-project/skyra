import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { MessageLogsEnum } from '#utils/constants';
import { ApplyOptions } from '@skyra/decorators';
import { GuildMember, MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.GuildMemberUpdate })
export default class extends Event {
	public async run(previous: GuildMember, next: GuildMember) {
		const [enabled, t] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Events.MemberNickNameUpdate],
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
					.setDescription(this.getNameDescription(t, prevNickname, nextNickname))
					.setFooter(t(LanguageKeys.Events.NicknameUpdate))
					.setTimestamp()
			);
		}
	}

	private getNameDescription(t: TFunction, previousName: string | null, nextName: string | null) {
		return [
			t(previousName === null ? LanguageKeys.Events.NameUpdatePreviousWasNotSet : LanguageKeys.Events.NameUpdatePreviousWasSet, {
				previousName
			}),
			t(nextName === null ? LanguageKeys.Events.NameUpdateNextWasNotSet : LanguageKeys.Events.NameUpdateNextWasSet, { nextName })
		].join('\n');
	}
}
