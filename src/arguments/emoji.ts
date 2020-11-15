import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { resolveEmoji } from '@utils/util';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<string> {
		const resolved = resolveEmoji(arg);
		if (resolved === null) throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidEmoji, { name: possible.name });
		return resolved;
	}
}
