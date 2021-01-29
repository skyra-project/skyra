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

	public async run(parameter: string, context: ArgumentContext<User>) {
		const message = context.message as GuildMessage;
		if (!message.guild) return this.user.run(parameter, context);

		const user = await this.resolveUser(message, parameter);
		if (user) return this.ok(user);
		if (user === null) return this.error({ parameter, identifier: LanguageKeys.Misc.UserNotExistent });

		const result = await this.fetchMember(message, parameter);
		if (result) return this.ok(message.guild.members.add(result).user);
		return this.error({ parameter, identifier: LanguageKeys.Resolvers.InvalidUsername });
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
