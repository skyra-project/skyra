import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const role = await args.pickResult('role');
		return role.success ? this.ok(role.value.id) : this.errorFromArgument(args, role.error);
	}

	public isValid(value: string, { entry, guild }: SerializerUpdateContext): Awaited<boolean> {
		if (guild.roles.cache.has(value)) return true;
		throw new UserError({ identifier: LanguageKeys.Serializers.InvalidRole, context: { name: entry.name } });
	}

	public stringify(value: string, { guild }: SerializerUpdateContext) {
		return guild.roles.cache.get(value)?.name ?? value;
	}
}
