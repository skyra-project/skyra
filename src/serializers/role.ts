import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('role');
		return result.match({
			ok: (value) => this.ok(value.id),
			err: (error) => this.errorFromArgument(args, error)
		});
	}

	public isValid(value: string, { t, entry, guild }: Serializer.UpdateContext): Awaitable<boolean> {
		if (guild.roles.cache.has(value)) return true;
		throw t(LanguageKeys.Serializers.InvalidRole, { name: entry.name });
	}

	public override stringify(value: string, { guild }: Serializer.UpdateContext) {
		return guild.roles.cache.get(value)?.name ?? value;
	}
}
