import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';

export default class UserSerializer extends Serializer<string> {
	public async parse(value: string, { t, entry }: SerializerUpdateContext) {
		const id = Serializer.regex.userOrMember.exec(value);
		const user = id ? await this.client.users.fetch(id[1]).catch(() => null) : null;
		if (user) return this.ok(user.id);
		return this.error(t(LanguageKeys.Resolvers.InvalidUser, { name: entry.name }));
	}

	public async isValid(value: string, { t, entry }: SerializerUpdateContext): Promise<boolean> {
		try {
			// If it's not a valid snowflake, throw
			if (!Serializer.regex.snowflake.test(value)) throw undefined;

			// Fetch the value, if it exists, it'll resolve and return true
			await this.client.users.fetch(value);
			return true;
		} catch {
			throw t(LanguageKeys.Resolvers.InvalidUser, { name: entry.name });
		}
	}

	public stringify(value: string) {
		return this.client.users.cache.get(value)?.tag ?? value;
	}
}
