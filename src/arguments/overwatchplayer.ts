import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public run(arg: string, _: Possible, message: KlasaMessage) {
		if (/[A-Za-z0-9]+(?:[#-][0-9]{4,5})?/i.test(arg)) return encodeURIComponent(arg.replace('#', '-'));
		throw message.language.get(LanguageKeys.Commands.GameIntegration.OverwatchInvalidPlayerName, { playerTag: arg });
	}
}
