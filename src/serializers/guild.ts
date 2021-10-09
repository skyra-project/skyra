import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		return this.result(args, await args.pickResult('snowflake'));
	}

	public isValid(value: string, { t, entry }: SerializerUpdateContext): Awaitable<boolean> {
		const guild = this.container.client.guilds.cache.get(value);
		if (!guild) {
			throw t(LanguageKeys.Serializers.InvalidGuild, { name: entry.name });
		}

		return true;
	}

	public stringify(value: string) {
		return (this.container.client.guilds.cache.get(value) || { name: value }).name;
	}
}
