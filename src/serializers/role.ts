import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, { t, entry, guild }: SerializerUpdateContext) {
		const id = UserSerializer.regex.role.exec(value);
		const role = id ? guild.roles.cache.get(id[1]) : guild.roles.cache.find((r) => r.name === value);
		if (role) return this.ok(role.id);
		return this.error(t(LanguageKeys.Resolvers.InvalidRole, { name: entry.name }));
	}

	public isValid(value: string, { t, entry, guild }: SerializerUpdateContext): Awaited<boolean> {
		if (guild.roles.cache.has(value)) return true;
		throw t(LanguageKeys.Resolvers.InvalidRole, { name: entry.name });
	}

	public stringify(value: string, { guild }: SerializerUpdateContext) {
		return guild.roles.cache.get(value)?.name ?? value;
	}
}
