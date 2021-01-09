import { Serializer, SerializerUpdateContext, UniqueRoleSet } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<UniqueRoleSet> {
	public parse(_: string, { t }: SerializerUpdateContext) {
		return this.error(t(LanguageKeys.Serializers.Unsupported));
	}

	public isValid(value: UniqueRoleSet, { t, guild }: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(value) &&
			Object.keys(value).length === 2 &&
			typeof value.name === 'string' &&
			Array.isArray(value.roles) &&
			value.roles.every((role) => typeof role === 'string' && guild.roles.cache.has(role))
		)
			return true;

		throw t(LanguageKeys.Serializers.UniqueRoleSetInvalid);
	}

	public stringify(value: UniqueRoleSet, { t, entity: { guild } }: SerializerUpdateContext) {
		return `[${value.name} -> \`${value.roles
			.map((role) => guild.roles.cache.get(role)?.name ?? t(LanguageKeys.Misc.UnknownRole))
			.join('` | `')}\`]`;
	}
}
