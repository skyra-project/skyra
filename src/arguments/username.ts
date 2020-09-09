import { FuzzySearch } from '@utils/FuzzySearch';
import { GuildMember, User } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const USER_REGEXP = Argument.regex.userOrMember;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {
	public get user() {
		return this.store.get('user')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: GuildMember) => boolean): Promise<User> {
		if (!arg) throw message.language.get('resolverInvalidUsername', { name: possible.name });
		if (!message.guild) return this.user.run(arg, possible, message);
		const resUser = await this.resolveUser(message, arg);
		if (resUser) return resUser;

		const result = await new FuzzySearch(message.guild.members.cache, (entry) => entry.displayName, filter).run(
			message,
			arg,
			possible.min || undefined
		);
		if (result) {
			return this.client.users.fetch(result[0]).catch(() => {
				throw message.language.get('userNotExistent');
			});
		}
		throw message.language.get('resolverInvalidUsername', { name: possible.name });
	}

	public resolveUser(message: KlasaMessage, query: string) {
		const id = USER_REGEXP.test(query) ? USER_REGEXP.exec(query)![1] : USER_TAG.test(query) ? this.client.users.getFromTag(query)?.id : null;

		if (id) {
			return this.client.users.fetch(id).catch(() => {
				throw message.language.get('userNotExistent');
			});
		}
		return null;
	}
}
