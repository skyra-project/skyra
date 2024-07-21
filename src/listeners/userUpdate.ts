import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events, type TypedT } from '#lib/types';
import { Colors } from '#utils/constants';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { Listener } from '@sapphire/framework';
import { filter } from '@sapphire/iterator-utilities/filter';
import { map } from '@sapphire/iterator-utilities/map';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { Guild, User } from 'discord.js';

export class UserListener extends Listener {
	public async run(previous: User, user: User) {
		const prevUsername = previous.username;
		const nextUserName = user.username;
		if (prevUsername === nextUserName) return;

		const promises = [
			...map(
				filter(this.container.client.guilds.cache.values(), (guild) => guild.members.cache.has(user.id)),
				(guild) => this.processGuild(guild, user, prevUsername, nextUserName)
			)
		];
		if (promises.length) await Promise.all(promises);
	}

	private async processGuild(guild: Guild, user: User, previous: string, next: string) {
		const settings = await readSettings(guild);
		const logChannelId = settings.channelsLogsMemberUserNameUpdate;
		if (!logChannelId) return;

		// Send the Username log
		const t = settings.getLanguage();
		this.container.client.emit(Events.GuildMessageLog, guild, logChannelId, GuildSettings.Channels.Logs.MemberUserNameUpdate, () =>
			this.buildEmbed(user, t, this.getNameDescription(t, previous, next), LanguageKeys.Events.Guilds.Members.UsernameUpdate)
		);
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

	private buildEmbed(user: User, t: TFunction, description: string, footerKey: TypedT<string>) {
		return new EmbedBuilder()
			.setColor(Colors.Yellow)
			.setAuthor(getFullEmbedAuthor(user))
			.setDescription(description)
			.setFooter({ text: t(footerKey) })
			.setTimestamp();
	}
}
