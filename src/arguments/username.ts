import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord.js-utilities';
import { Argument, ArgumentContext } from '@sapphire/framework';
import type { RESTGetAPIGuildMembersSearchResult } from 'discord-api-types/v6';
import type { User } from 'discord.js';

export class UserArgument extends Argument<User> {
	private get user(): Argument<User> {
		return this.store.get('user') as Argument<User>;
	}

	public async run(argument: string, context: ArgumentContext) {
		const message = context.message as GuildMessage;
		if (!message.guild) return this.user.run(argument, context);

		const user = await this.resolveUser(message, argument);
		if (user) return this.ok(user);
		if (user === null) return this.error(argument, LanguageKeys.Misc.UserNotExistent);

		const result = await this.fetchMember(message, argument);
		if (result) return this.ok(message.guild.members.add(result).user);
		return this.error(argument, LanguageKeys.Resolvers.InvalidUsername);
	}

	private async resolveUser(message: GuildMessage, argument: string) {
		const result = UserOrMemberMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		if (result === null) return undefined;

		try {
			return await message.client.users.fetch(result[1]);
		} catch {
			return null;
		}
	}

	private async fetchMember(message: GuildMessage, query: string) {
		try {
			const [result] = (await api().guilds(message.guild.id).members.search.get({ query: { query } })) as RESTGetAPIGuildMembersSearchResult;
			return result;
		} catch {
			return null;
		}
	}
}
