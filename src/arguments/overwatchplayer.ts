import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public run(argument: string) {
		if (/[A-Za-z0-9]+(?:[#-][0-9]{4,5})?/i.test(argument)) return this.ok(encodeURIComponent(argument.replace('#', '-')));
		return this.error(argument, LanguageKeys.Commands.GameIntegration.OverwatchInvalidPlayerName);
	}
}
