import { Serializer, SerializerUpdateContext, UniqueRoleSet } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<UniqueRoleSet> {
	public parse() {
		// TODO (kyranet): implement this
		return this.error('Method not implemented.');
	}

	public isValid(value: UniqueRoleSet, context: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(value) &&
			Object.keys(value).length === 2 &&
			typeof value.name === 'string' &&
			Array.isArray(value.roles) &&
			value.roles.every((role) => typeof role === 'string' && context.entity.guild!.roles.cache.has(role))
		)
			return true;

		throw context.language.get(LanguageKeys.Serializers.UniqueRoleSetInvalid);
	}

	public stringify(value: UniqueRoleSet, { language, entity: { guild } }: SerializerUpdateContext) {
		return `[${value.name} -> \`${value.roles
			.map((role) => guild.roles.cache.get(role)?.name ?? language.get(LanguageKeys.Misc.UnknownRole))
			.join('` | `')}\`]`;
	}
}
