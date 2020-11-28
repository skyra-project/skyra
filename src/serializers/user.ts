import { Serializer, SerializerUpdateContext } from '#lib/database/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';

export default class UserSerializer extends Serializer<string> {
	public async parse(value: string, context: SerializerUpdateContext) {
		const id = Serializer.regex.userOrMember.exec(value);
		const user = id ? await this.client.users.fetch(id[1]).catch(() => null) : null;
		if (user) return this.ok(user.id);
		return this.error(context.language.get(LanguageKeys.Resolvers.InvalidUser, { name: context.entry.name }));
	}

	public async isValid(value: string, context: SerializerUpdateContext): Promise<boolean> {
		try {
			// If it's not a valid snowflake, throw
			if (!Serializer.regex.snowflake.test(value)) throw undefined;

			// Fetch the value, if it exists, it'll resolve and return true
			await this.client.users.fetch(value);
			return true;
		} catch {
			throw context.language.get(LanguageKeys.Resolvers.InvalidUser, { name: context.entry.name });
		}
	}

	public stringify(value: string) {
		return this.client.users.cache.get(value)?.tag ?? value;
	}
}
