import { LanguageKeys } from '#lib/i18n/languageKeys';
import { resolveEmoji } from '#utils/util';
import type { Message } from 'discord.js';
import { Argument, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: Message): Promise<string> {
		const resolved = resolveEmoji(arg);
		if (resolved === null) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidEmoji, { name: possible.name });
		return resolved;
	}
}
