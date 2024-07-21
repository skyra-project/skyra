import { Serializer, type StickyRole } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isObject, type Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<StickyRole> {
	public parse(_: Serializer.Args, { t }: Serializer.UpdateContext) {
		return this.error(t(LanguageKeys.Serializers.Unsupported));
	}

	public isValid(value: StickyRole, { t, guild }: Serializer.UpdateContext): Awaitable<boolean> {
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

	public override stringify(value: StickyRole, { t, guild }: Serializer.UpdateContext) {
		const username = guild.client.users.cache.get(value.user)?.username ?? t(LanguageKeys.Serializers.UnknownUser);
		const roles = value.roles.map((role) => guild.roles.cache.get(role)?.name ?? t(LanguageKeys.Serializers.UnknownRole));
		return `[${username} -> ${roles}]`;
	}
}
