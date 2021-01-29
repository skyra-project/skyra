import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public run(parameter: string) {
		if (/[A-Za-z0-9]+(?:[#-][0-9]{4,5})?/i.test(parameter)) return this.ok(encodeURIComponent(parameter.replace('#', '-')));
		return this.error({ parameter, identifier: LanguageKeys.Commands.GameIntegration.OverwatchInvalidPlayerName });
	}
}
