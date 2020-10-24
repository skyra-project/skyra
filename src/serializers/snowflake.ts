import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { DiscordSnowflake } from '@sapphire/snowflake';

export default class extends Serializer {
	/**
	 * The validator, requiring all numbers and 17 to 19 digits (future-proof).
	 */
	private readonly kRegExp = /^\d{17,19}$/;

	/**
	 * Stanislav's join day, known as the oldest user in Discord, and practically
	 * the lowest snowflake we can get (as they're bound by the creation date).
	 */
	private readonly kMinimum = new Date(2015, 1, 28).getTime();

	public validate(data: string, { entry, language }: SerializerUpdateContext) {
		if (this.kRegExp.test(data)) {
			const snowflake = DiscordSnowflake.deconstruct(data);
			const timestamp = Number(snowflake.timestamp);
			if (timestamp >= this.kMinimum && timestamp < Date.now()) return data;
		}
		throw language.get(LanguageKeys.Resolvers.InvalidSnowflake, { name: entry.key });
	}
}
