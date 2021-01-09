import { GuildSettings } from '#lib/database';
import { filter, map } from '#lib/misc';
import { CustomGet } from '#lib/types';
import { Colors } from '#lib/types/constants/Constants';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { MessageLogsEnum } from '#utils/constants';
import { Guild, MessageEmbed, User } from 'discord.js';
import { TFunction } from 'i18next';
import { Event } from 'klasa';

export default class extends Event {
	public async run(previous: User, user: User) {
		const prevUsername = previous.username;
		const nextUserName = user.username;
		if (prevUsername === nextUserName) return;

		const promises = [
			...map(
				filter(this.client.guilds.cache.values(), (guild) => guild.members.cache.has(user.id)),
				(guild) => this.processGuild(guild, user, prevUsername, nextUserName)
			)
		];
		if (promises.length) await Promise.all(promises);
	}

	private async processGuild(guild: Guild, user: User, previous: string, next: string) {
		const [enabled, language] = await guild.readSettings((settings) => [
			settings[GuildSettings.Events.MemberUserNameUpdate],
			settings.getLanguage()
		]);

		if (enabled) {
			// Send the Username log
			this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () =>
				this.buildEmbed(user, language, this.getNameDescription(language, previous, next), LanguageKeys.Events.UsernameUpdate)
			);
		}
	}

	private getNameDescription(t: TFunction, previousName: string | null, nextName: string | null) {
		const previous = previousName === null ? LanguageKeys.Events.NameUpdatePreviousWasNotSet : LanguageKeys.Events.NameUpdatePreviousWasSet;
		const next = nextName === null ? LanguageKeys.Events.NameUpdateNextWasNotSet : LanguageKeys.Events.NameUpdateNextWasSet;
		return [t(previous, { previousName }), t(next, { nextName })].join('\n');
	}

	private buildEmbed(user: User, t: TFunction, description: string, footerKey: CustomGet<string, string>) {
		return new MessageEmbed()
			.setColor(Colors.Yellow)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(description)
			.setFooter(t(footerKey))
			.setTimestamp();
	}
}
