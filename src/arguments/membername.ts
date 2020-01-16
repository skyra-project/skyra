import { FuzzySearch } from '@utils/FuzzySearch';
import { Argument, KlasaMessage, Possible } from 'klasa';
import { MemberTag } from '@utils/Cache/MemberTags';

const USER_REGEXP = Argument.regex.userOrMember;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: string) => boolean) {
		if (!arg) throw message.language.tget('RESOLVER_INVALID_USERNAME', possible.name);
		const resMember = await this.resolveMember(message, arg);
		if (resMember) return resMember;

		const result = await new FuzzySearch(message.guild!.memberTags.mapUsernames(), entry => entry, filter).run(message, arg, possible.min || undefined);
		if (result) {
			const id = result[0];
			const memberTag = await message.guild!.memberTags.get(id);
			if (memberTag) return { ...memberTag, id };
			throw message.language.tget('RESOLVER_MEMBERNAME_USER_LEFT_DURING_PROMPT');
		}
		throw message.language.tget('RESOLVER_INVALID_USERNAME', possible.name);
	}

	public async resolveMember(message: KlasaMessage, query: string) {
		const id = USER_REGEXP.test(query)
			? USER_REGEXP.exec(query)![1]
			: USER_TAG.test(query)
				? this.client.userTags.getKeyFromTag(query) || null
				: null;

		if (id) {
			const memberTag = await message.guild!.memberTags.fetch(id);
			if (memberTag) return { ...memberTag, id };
			throw message.language.tget('USER_NOT_EXISTENT');
		}
		return null;
	}

}

export interface KeyedMemberTag extends MemberTag {
	id: string;
}
