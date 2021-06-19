import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SnowflakeRegex } from '@sapphire/discord.js-utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('user');
		return result.success ? this.ok(result.value.id) : this.errorFromArgument(args, result.error);
	}

	public async isValid(value: string, { t, entry }: SerializerUpdateContext): Promise<boolean> {
		try {
			// If it's not a valid snowflake, throw
			if (!SnowflakeRegex.test(value)) throw undefined;

			// Fetch the value, if it exists, it'll resolve and return true
			await this.context.client.users.fetch(value);
			return true;
		} catch {
			throw t(LanguageKeys.Serializers.InvalidUser, { name: entry.name });
		}
	}

	public stringify(value: string) {
		return this.context.client.users.cache.get(value)?.tag ?? value;
	}
}
