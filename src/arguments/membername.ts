import { api } from '@utils/Models/Api';
import { RESTGetAPIGuildMembersSearchResult } from 'discord-api-types/v6';
import { GuildMember } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const USER_REGEXP = Argument.regex.userOrMember;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<GuildMember> {
		if (!arg) throw message.language.get('resolverInvalidUsername', { name: possible.name });
		const resMember = await this.resolveMember(message, arg);
		if (resMember) return resMember;

		const result = await this.fetchMember(arg, message);
		if (result) return message.guild!.members.add(result);
		throw message.language.get('resolverInvalidUsername', { name: possible.name });
	}

	private async resolveMember(message: KlasaMessage, query: string): Promise<GuildMember | null> {
		const id = USER_REGEXP.test(query) ? USER_REGEXP.exec(query)![1] : USER_TAG.test(query) ? this.client.users.getFromTag(query)?.id : null;

		if (id) {
			const member = await message.guild!.members.fetch(id);
			if (member) return member;
			throw message.language.get('userNotExistent');
		}
		return null;
	}

	private async fetchMember(query: string, message: KlasaMessage) {
		const [result] = (await api(this.client)
			.guilds(message.guild!.id)
			.members.search.get({ query: { query } })) as RESTGetAPIGuildMembersSearchResult;
		return result;
	}
}
