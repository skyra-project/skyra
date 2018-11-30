import { Argument, KlasaMessage, KlasaUser, Possible } from 'klasa';
import { FuzzySearch } from '../lib/util/FuzzySearch';
const USER_REGEXP = /^(?:<@!?)?(\d{17,19})>?$/;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {

	public get user(): any {
		return this.store.get('user');
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: string) => boolean): Promise<any> {
		if (!arg) throw message.language.get('RESOLVER_INVALID_USERNAME', possible.name);
		if (!message.guild) return this.user.run(arg, possible, message);
		const resUser = await this.resolveUser(arg);
		if (resUser) return resUser;

		const result = await new FuzzySearch(message.guild.memberUsernames, (entry) => entry, filter).run(message, arg);
		if (result) return this.client.users.fetch(result[0]);
		throw message.language.get('RESOLVER_INVALID_USERNAME', possible.name);
	}

	public resolveUser(query: string): Promise<KlasaUser> {
		const id = USER_REGEXP.test(query)
			? USER_REGEXP.exec(query)[1]
			: USER_TAG.test(query)
				? this.client.usertags.findKey((tag) => tag === query) || null
				: null;

		if (id) return this.client.users.fetch(id);
		return null;
	}

}
