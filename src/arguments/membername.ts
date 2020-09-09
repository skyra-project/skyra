import { FuzzySearch } from '@utils/FuzzySearch';
import { GuildMember } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const USER_REGEXP = Argument.regex.userOrMember;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: string) => boolean): Promise<GuildMember> {
		if (!arg) throw message.language.get('resolverInvalidUsername', { name: possible.name });
		const resMember = await this.resolveMember(message, arg);
		if (resMember) return resMember;

		const result = await new FuzzySearch(
			message.guild!.members.cache.mapValues((member) => member.displayName),
			(entry) => entry,
			filter
		).run(message, arg, possible.min || undefined);
		if (result) {
			const id = result[0];
			const member = message.guild!.members.cache.get(id);
			if (member) return member;
			throw message.language.get('resolverMembernameUserLeftDuringPrompt');
		}
		throw message.language.get('resolverInvalidUsername', { name: possible.name });
	}

	public async resolveMember(message: KlasaMessage, query: string): Promise<GuildMember | null> {
		const id = USER_REGEXP.test(query) ? USER_REGEXP.exec(query)![1] : USER_TAG.test(query) ? this.client.users.getFromTag(query)?.id : null;

		if (id) {
			const member = await message.guild!.members.fetch(id);
			if (member) return member;
			throw message.language.get('userNotExistent');
		}
		return null;
	}
}
