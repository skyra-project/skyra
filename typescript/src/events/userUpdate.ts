import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { CustomGet } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { filter, map } from '#utils/common';
import { Event } from '@sapphire/framework';
import { Guild, MessageEmbed, User } from 'discord.js';
import type { TFunction } from 'i18next';

export class UserEvent extends Event {
	public async run(previous: User, user: User) {
		const prevUsername = previous.username;
		const nextUserName = user.username;
		if (prevUsername === nextUserName) return;

		const promises = [
			...map(
				filter(this.context.client.guilds.cache.values(), (guild) => guild.members.cache.has(user.id)),
				(guild) => this.processGuild(guild, user, prevUsername, nextUserName)
			)
		];
		if (promises.length) await Promise.all(promises);
	}

	private async processGuild(guild: Guild, user: User, previous: string, next: string) {
		const [logChannelId, language] = await readSettings(guild, (settings) => [
			settings[GuildSettings.Channels.Logs.MemberUserNameUpdate],
			settings.getLanguage()
		]);

		if (logChannelId) {
			// Send the Username log
			this.context.client.emit(Events.GuildMessageLog, guild, logChannelId, GuildSettings.Channels.Logs.MemberUserNameUpdate, () =>
				this.buildEmbed(user, language, this.getNameDescription(language, previous, next), LanguageKeys.Events.Guilds.Members.UsernameUpdate)
			);
		}
	}

	private getNameDescription(t: TFunction, previousName: string | null, nextName: string | null) {
		const previous =
			previousName === null
				? LanguageKeys.Events.Guilds.Members.NameUpdatePreviousWasNotSet
				: LanguageKeys.Events.Guilds.Members.NameUpdatePreviousWasSet;
		const next =
			nextName === null ? LanguageKeys.Events.Guilds.Members.NameUpdateNextWasNotSet : LanguageKeys.Events.Guilds.Members.NameUpdateNextWasSet;
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
