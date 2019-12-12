import { Argument, KlasaMessage, Possible } from 'klasa';
import { FuzzySearch } from '../lib/util/FuzzySearch';

const USER_REGEXP = Argument.regex.userOrMember;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: string) => boolean) {
		if (!arg) throw message.language.tget('RESOLVER_INVALID_USERNAME', possible.name);
		const resMember = await this.resolveMember(message, arg);
		if (resMember) return resMember;

		const result = await new FuzzySearch(message.guild!.memberTags.mapUsernames(), entry => entry, filter).run(message, arg, possible.min || undefined);
		if (result) {
			return message.guild!.members.fetch(result[0])
				.catch(() => { throw message.language.tget('USER_NOT_EXISTENT'); });
		}
		throw message.language.tget('RESOLVER_INVALID_USERNAME', possible.name);
	}

	public resolveMember(message: KlasaMessage, query: string) {
		const id = USER_REGEXP.test(query)
			? USER_REGEXP.exec(query)![1]
			: USER_TAG.test(query)
				? this.client.userTags.getKeyFromTag(query) || null
				: null;

		if (id) {
			return message.guild!.members.fetch(id)
				.catch(() => { throw message.language.tget('USER_NOT_EXISTENT'); });
		}
		return null;
	}

}
