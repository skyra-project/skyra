import { Serializer, SerializerUpdateContext, StickyRole } from '#lib/database/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<StickyRole> {
	public parse(_: string, context: SerializerUpdateContext) {
		return this.error(context.language.get(LanguageKeys.Serializers.Unsupported));
	}

	public isValid(value: StickyRole, context: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(value) &&
			Object.keys(value).length === 2 &&
			typeof value.user === 'string' &&
			Array.isArray(value.roles) &&
			value.roles.every((role) => typeof role === 'string' && context.guild.roles.cache.has(role))
		)
			return true;

		throw context.language.get(LanguageKeys.Serializers.StickyRoleInvalid);
	}

	public stringify(value: StickyRole, context: SerializerUpdateContext) {
		const username = this.client.users.cache.get(value.user)?.username ?? context.language.get(LanguageKeys.Misc.UnknownUser);
		const roles = value.roles.map((role) => context.guild.roles.cache.get(role)?.name ?? context.language.get(LanguageKeys.Misc.UnknownRole));
		return `[${username} -> ${roles}]`;
	}
}
