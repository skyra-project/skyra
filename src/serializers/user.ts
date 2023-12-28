import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getTag } from '#utils/util';
import { SnowflakeRegex } from '@sapphire/discord.js-utilities';
import { isNullish } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('user');
		return result.match({
			ok: (value) => this.ok(value.id),
			err: (error) => this.errorFromArgument(args, error)
		});
	}

	public async isValid(value: string, { t, entry }: Serializer.UpdateContext): Promise<boolean> {
		try {
			// If it's not a valid snowflake, throw
			if (!SnowflakeRegex.test(value)) throw undefined;

			// Fetch the value, if it exists, it'll resolve and return true
			await this.container.client.users.fetch(value);
			return true;
		} catch {
			throw t(LanguageKeys.Serializers.InvalidUser, { name: entry.name });
		}
	}

	public override stringify(value: string) {
		const user = this.container.client.users.cache.get(value);
		return isNullish(user) ? value : getTag(user);
	}
}
