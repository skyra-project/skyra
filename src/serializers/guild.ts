import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public parse(args: Serializer.Args) {
		return args.pickResult('snowflake');
	}

	public isValid(value: string, { t, entry }: SerializerUpdateContext): Awaited<boolean> {
		const guild = this.context.client.guilds.cache.get(value);
		if (!guild) {
			throw t(LanguageKeys.Serializers.InvalidGuild, { name: entry.name });
		}

		return true;
	}

	public stringify(value: string) {
		return (this.context.client.guilds.cache.get(value) || { name: value }).name;
	}
}
