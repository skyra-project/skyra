import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isGuildMessage } from '#utils/common';
import { FuzzySearch } from '#utils/Parsers/FuzzySearch';
import { validateChannelAccess } from '#utils/util';
import { ChannelMentionRegex, SnowflakeRegex } from '@sapphire/discord.js-utilities';
import { Argument } from '@sapphire/framework';
import type { Guild, GuildChannel, ThreadChannel, User } from 'discord.js';

export class UserArgument extends Argument<GuildChannel | ThreadChannel> {
	public resolveChannel(query: string, guild: Guild) {
		const channelId = ChannelMentionRegex.exec(query) ?? SnowflakeRegex.exec(query);
		return (channelId !== null && guild.channels.cache.get(channelId.groups!.id)) ?? null;
	}

	public async run(parameter: string, { message, minimum, context, filter }: ChannelArgumentContext) {
		if (!isGuildMessage(message)) return this.error({ parameter, identifier: LanguageKeys.Arguments.GuildChannelMissingGuildError, context });
		filter = this.getFilter(message.author, filter);

		const resChannel = this.resolveChannel(parameter, message.guild);
		if (resChannel) {
			if (filter(resChannel)) return this.ok(resChannel);
			return this.error({ parameter, identifier: LanguageKeys.Arguments.GuildChannelMismatchingError, context });
		}

		const result = await new FuzzySearch(message.guild.channels.cache, (entry) => entry.name, filter).run(message, parameter, minimum);
		if (result) return this.ok(result[1]);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.GuildChannelError, context });
	}

	private getFilter(author: User, filter?: (entry: GuildChannel | ThreadChannel) => boolean) {
		const clientUser = author.client.user!;
		return typeof filter === 'undefined'
			? (entry: GuildChannel | ThreadChannel) => validateChannelAccess(entry, author) && validateChannelAccess(entry, clientUser)
			: (entry: GuildChannel | ThreadChannel) =>
					filter(entry) && validateChannelAccess(entry, author) && validateChannelAccess(entry, clientUser);
	}
}

interface ChannelArgumentContext extends Argument.Context<GuildChannel | ThreadChannel> {
	filter?: (entry: GuildChannel | ThreadChannel) => boolean;
}
