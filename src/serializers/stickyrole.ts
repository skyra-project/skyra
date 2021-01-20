import { Serializer, SerializerUpdateContext, StickyRole } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<StickyRole> {
	public parse(_: string, { t }: SerializerUpdateContext) {
		return this.error(t(LanguageKeys.Serializers.Unsupported));
	}

	public isValid(value: StickyRole, { t, guild }: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(value) &&
			Object.keys(value).length === 2 &&
			typeof value.user === 'string' &&
			Array.isArray(value.roles) &&
			value.roles.every((role) => typeof role === 'string' && guild.roles.cache.has(role))
		)
			return true;

		throw t(LanguageKeys.Serializers.StickyRoleInvalid);
	}

	public stringify(value: StickyRole, { t, guild }: SerializerUpdateContext) {
		const username = guild.client.users.cache.get(value.user)?.username ?? t(LanguageKeys.Misc.UnknownUser);
		const roles = value.roles.map((role) => guild.roles.cache.get(role)?.name ?? t(LanguageKeys.Misc.UnknownRole));
		return `[${username} -> ${roles}]`;
	}
}
