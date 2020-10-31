import { Serializer, SerializerUpdateContext } from '@lib/database';

export default class UserSerializer extends Serializer<string> {
	public async parse(value: string, context: SerializerUpdateContext): Promise<string> {
		const id = Serializer.regex.userOrMember.exec(value);
		const user = id ? await this.client.users.fetch(id[1]).catch(() => null) : null;
		if (user) return user.id;
		throw context.language.get('resolverInvalidUser', { name: context.entry.name });
	}

	public async isValid(value: string, context: SerializerUpdateContext): Promise<boolean> {
		try {
			// If it's not a valid snowflake, throw
			if (!Serializer.regex.snowflake.test(value)) throw undefined;

			// Fetch the value, if it exists, it'll resolve and return true
			await this.client.users.fetch(value);
			return true;
		} catch {
			throw context.language.get('resolverInvalidUser', { name: context.entry.name });
		}
	}

	public stringify(value: string) {
		return this.client.users.cache.get(value)?.username ?? value;
	}
}
