import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { resolveEmoji } from '@utils/util';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public run(arg: string, possible: Possible, message: KlasaMessage): string {
		const resolved = resolveEmoji(arg);
		if (resolved === null) throw message.language.get(LanguageKeys.Resolvers.InvalidEmoji, { name: possible.name });
		return resolved;
	}
}
