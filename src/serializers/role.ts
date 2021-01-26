import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const role = await args.pickResult('role');
		return role.success ? this.ok(role.value.id) : role;
	}

	public isValid(value: string, { t, entry, guild }: SerializerUpdateContext): Awaited<boolean> {
		if (guild.roles.cache.has(value)) return true;
		throw t(LanguageKeys.Resolvers.InvalidRole, { name: entry.name });
	}

	public stringify(value: string, { guild }: SerializerUpdateContext) {
		return guild.roles.cache.get(value)?.name ?? value;
	}
}
