import { Serializer, SerializerUpdateContext } from '#lib/database/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, context: SerializerUpdateContext) {
		const id = UserSerializer.regex.role.exec(value);
		const role = id ? context.guild.roles.cache.get(id[1]) : context.guild.roles.cache.find((r) => r.name === value);
		if (role) return this.ok(role.id);
		return this.error(context.language.get(LanguageKeys.Resolvers.InvalidRole, { name: context.entry.name }));
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		if (context.guild.roles.cache.has(value)) return true;
		throw context.language.get(LanguageKeys.Resolvers.InvalidRole, { name: context.entry.name });
	}

	public stringify(value: string, context: SerializerUpdateContext) {
		return context.guild.roles.cache.get(value)?.name ?? value;
	}
}
