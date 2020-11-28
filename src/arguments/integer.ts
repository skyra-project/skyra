import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Argument, ArgumentOptions, KlasaMessage, Possible } from 'klasa';

@ApplyOptions<ArgumentOptions>({ aliases: ['int'] })
export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage) {
		if (!arg) throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidInt, { name: possible.name });

		const number = Number(arg);
		if (!Number.isInteger(number)) throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidInt, { name: possible.name });

		const { min, max } = possible;

		// @ts-expect-error 2341
		return Argument.minOrMax(this.client, number, min, max, possible, message, '') ? number : null;
	}
}
