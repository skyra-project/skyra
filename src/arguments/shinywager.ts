import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';
import { Argument, ArgumentOptions, Possible } from 'klasa';

@ApplyOptions<ArgumentOptions>({ aliases: ['wager'] })
export default class ShinyWager extends Argument {
	public async run(arg: string, possible: Possible, message: Message): Promise<number> {
		if (!arg) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidInt, { name: possible.name });

		const number = Number(arg) as ArrayValues<typeof ShinyWager.kValidBetAmounts>;
		if (!Number.isInteger(number)) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidInt, { name: possible.name });
		if (!ShinyWager.kValidBetAmounts.includes(number)) {
			throw await message.resolveKey(LanguageKeys.Resolvers.InvalidWager, {
				bet: number,
				validAmounts: ShinyWager.kValidBetAmounts.map((a) => a.toString())
			});
		}

		return this.integerArg.run(arg, possible, message);
	}

	private get integerArg() {
		return this.store.get('integer')!;
	}

	public static readonly kValidBetAmounts = [50, 100, 200, 500, 1000, 2000, 5000, 10_000, 20_000, 25_000, 50_000, 100_000, 500_000] as const;
}

type ArrayValues<T extends readonly unknown[] = readonly unknown[]> = T[number];
