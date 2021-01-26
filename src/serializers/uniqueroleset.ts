import { Serializer, SerializerUpdateContext, UniqueRoleSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export class UserSerializer extends Serializer<UniqueRoleSet> {
	public async parse(args: Serializer.Args) {
		const name = await args.pickResult('string');
		if (!name.success) return name;

		const roles = await args.repeatResult('role');
		if (!roles.success) return roles;

		return this.ok({ name: name.value, roles: roles.value.map((role) => role.id) });
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
			.map((role) => guild.roles.cache.get(role)?.name ?? t(LanguageKeys.Serializers.UnknownRole))
			.join('` | `')}\`]`;
	}
}
