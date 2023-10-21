import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument } from '@sapphire/framework';
import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Snowflake } from 'discord.js';

export class UserArgument extends Argument<Snowflake> {
	/**
	 * The validator, requiring all numbers and 17 to 19 digits (future-proof).
	 */
	private readonly kRegExp = /^\d{17,19}$/;

	/**
	 * Stanislav's join day, known as the oldest user in Discord, and practically
	 * the lowest snowflake we can get (as they're bound by the creation date).
	 */
	private readonly kMinimum = new Date(2015, 1, 28).getTime();

	public run(parameter: string, context: Argument.Context) {
		if (this.kRegExp.test(parameter)) {
			const snowflake = DiscordSnowflake.deconstruct(parameter);
			const timestamp = Number(snowflake.timestamp);
			if (timestamp >= this.kMinimum && timestamp < Date.now()) return this.ok(parameter);
		}
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Snowflake, context });
	}
}
