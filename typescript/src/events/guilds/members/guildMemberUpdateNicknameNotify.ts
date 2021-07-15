import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildMember, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<EventOptions>({ event: Events.GuildMemberUpdate })
export class UserEvent extends Event {
	public async run(previous: GuildMember, next: GuildMember) {
		const key = GuildSettings.Channels.Logs.MemberNickNameUpdate;
		const [logChannelId, t] = await next.guild.readSettings((settings) => [settings[key], settings.getLanguage()]);
		if (isNullish(logChannelId)) return;

		// Send the Nickname log
		const prevNickname = previous.nickname;
		const nextNickname = next.nickname;
		const { user } = next;
		if (prevNickname !== nextNickname) {
			this.context.client.emit(Events.GuildMessageLog, next.guild, logChannelId, key, () =>
				new MessageEmbed()
					.setColor(Colors.Yellow)
					.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
					.setDescription(this.getNameDescription(t, prevNickname, nextNickname))
					.setFooter(t(LanguageKeys.Events.Guilds.Members.NicknameUpdate))
					.setTimestamp()
			);
		}
	}

	private getNameDescription(t: TFunction, previousName: string | null, nextName: string | null) {
		return [
			t(
				previousName === null
					? LanguageKeys.Events.Guilds.Members.NameUpdatePreviousWasNotSet
					: LanguageKeys.Events.Guilds.Members.NameUpdatePreviousWasSet,
				{
					previousName
				}
			),
			t(
				nextName === null
					? LanguageKeys.Events.Guilds.Members.NameUpdateNextWasNotSet
					: LanguageKeys.Events.Guilds.Members.NameUpdateNextWasSet,
				{ nextName }
			)
		].join('\n');
	}
}
