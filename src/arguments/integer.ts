import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import { Argument, ArgumentOptions, Possible } from 'klasa';

@ApplyOptions<ArgumentOptions>({ aliases: ['int'] })
export default class extends Argument {
	public async run(arg: string, possible: Possible, message: Message) {
		if (!arg) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidInt, { name: possible.name });

		const number = Number(arg);
		if (!Number.isInteger(number)) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidInt, { name: possible.name });

		const { min, max } = possible;

		return (await Argument.minOrMax(number, min, max, possible, message, '')) ? number : null;
	}
}
