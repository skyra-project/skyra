import { Serializer, type UniqueRoleSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isObject, type Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<UniqueRoleSet> {
	public async parse(args: Serializer.Args) {
		const name = await args.pickResult('string');
		if (name.isErr()) return this.errorFromArgument(args, name.unwrapErr());

		const roles = await args.repeatResult('role');
		if (roles.isErr()) return this.errorFromArgument(args, roles.unwrapErr());

		return this.ok({ name: name.unwrap(), roles: roles.unwrap().map((role) => role.id) });
	}

	public isValid(value: UniqueRoleSet, { t, guild }: Serializer.UpdateContext): Awaitable<boolean> {
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

	public override stringify(value: UniqueRoleSet, { t, entity: { guild } }: Serializer.UpdateContext) {
		return `[${value.name} -> \`${value.roles
			.map((role) => guild.roles.cache.get(role)?.name ?? t(LanguageKeys.Serializers.UnknownRole))
			.join('` | `')}\`]`;
	}
}
