import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { api } from '#lib/discord/Api';
import { RESTGetAPIGuildMembersSearchResult } from 'discord-api-types/v6';
import { Message, User } from 'discord.js';
import { Argument, Possible } from 'klasa';

const USER_REGEXP = Argument.regex.userOrMember;

export default class extends Argument {
	public get user() {
		return this.store.get('user')!;
	}

	public async run(arg: string, possible: Possible, message: Message): Promise<User> {
		if (!arg) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidUsername, { name: possible.name });
		if (!message.guild) return this.user.run(arg, possible, message);
		const resUser = await this.resolveUser(message as GuildMessage, arg);
		if (resUser) return resUser;

		const result = await this.fetchMember(message as GuildMessage, arg);
		if (result) return message.guild.members.add(result).user;
		throw await message.resolveKey(LanguageKeys.Resolvers.InvalidUsername, { name: possible.name });
	}

	private async resolveUser(message: GuildMessage, query: string) {
		const result = USER_REGEXP.exec(query);
		if (result === null) return null;

		try {
			return await this.client.users.fetch(result[1]);
		} catch {
			throw await message.resolveKey(LanguageKeys.Misc.UserNotExistent);
		}
	}

	private async fetchMember(message: GuildMessage, query: string) {
		const [result] = (await api(this.client)
			.guilds(message.guild.id)
			.members.search.get({ query: { query } })) as RESTGetAPIGuildMembersSearchResult;
		return result;
	}
}
