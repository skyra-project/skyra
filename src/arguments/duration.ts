import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument } from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';

export class UserArgument extends Argument<Date> {
	public async run(argument: string) {
		const date = new Duration(argument).fromNow;
		if (!isNaN(date.getTime()) && date.getTime() > Date.now()) return this.ok(date);
		return this.error(argument, LanguageKeys.Resolvers.InvalidDuration);
	}
}
