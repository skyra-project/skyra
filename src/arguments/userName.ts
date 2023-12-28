import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { isGuildMessage } from '#utils/common';
import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord.js-utilities';
import { Argument, Identifiers } from '@sapphire/framework';
import type { User } from 'discord.js';

export class UserArgument extends Argument<User> {
	private get user(): Argument<User> {
		return this.store.get('user') as Argument<User>;
	}

	public async run(parameter: string, context: Argument.Context<User>) {
		const message = context.message as GuildMessage;
		if (!isGuildMessage(message)) return this.user.run(parameter, context);

		const user = await this.resolveUser(message, parameter);
		if (user) return this.ok(user);
		if (user === null) return this.error({ parameter, identifier: Identifiers.ArgumentUserError, context });

		const result = await this.fetchMember(message, parameter);
		if (result) return this.ok(result.user);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.UserError, context });
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
			const results = await message.guild.members.fetch({ query });
			return results.first() ?? null;
		} catch {
			return null;
		}
	}
}
