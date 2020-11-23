import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { api } from '@utils/Models/Api';
import { RESTGetAPIGuildMembersSearchResult } from 'discord-api-types/v6';
import { GuildMember } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const USER_REGEXP = Argument.regex.userOrMember;

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<GuildMember> {
		if (!arg) throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidUsername, { name: possible.name });
		const resMember = await this.resolveMember(message, arg);
		if (resMember) return resMember;

		const result = await this.fetchMember(arg, message);
		if (result) return message.guild!.members.add(result);
		throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidUsername, { name: possible.name });
	}

	private async resolveMember(message: KlasaMessage, query: string): Promise<GuildMember | null> {
		const result = USER_REGEXP.exec(query);
		if (result === null) return null;

		const member = await message.guild!.members.fetch(result[1]);
		if (member) return member;
		throw await message.fetchLocale(LanguageKeys.Misc.UserNotExistent);
	}

	private async fetchMember(query: string, message: KlasaMessage) {
		const [result] = (await api(this.client)
			.guilds(message.guild!.id)
			.members.search.get({ query: { query } })) as RESTGetAPIGuildMembersSearchResult;
		return result;
	}
}
