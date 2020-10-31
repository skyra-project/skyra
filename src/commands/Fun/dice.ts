import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isNumber } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['roll'],
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.Fun.DiceDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.DiceExtended),
	usage: '[amount:integer|dice:string]',
	spam: true
})
export default class extends SkyraCommand {
	/**
	 * Syntax  : {number}?[ ]d[ ]{number}[ ]{.*?}
	 * Examples:
	 *  - 4d6
	 *  - d20
	 *  - 2d8+2
	 */
	private readonly kDice20RegExp = /^(\d+)?\s*d\s*(\d+)\s*(.*?)$/;

	/**
	 * Syntax  : {+-}[ ]{number}
	 * Examples:
	 *  - +20
	 *  - -50
	 *  - + 70
	 */
	private readonly kDice20TrailRegExp = /([+-])\s*(\d+)/g;

	public async run(message: KlasaMessage, [amountOrDice = 1]: [number | string | undefined]) {
		return message.sendLocale(LanguageKeys.Commands.Fun.DiceOutput, [
			{
				result: await this.roll(message, amountOrDice)
			}
		]);
	}

	private async roll(message: KlasaMessage, pattern: string | number) {
		let amount: number | undefined = undefined;
		let dice: number | undefined = undefined;
		let modifier = 0;
		const language = await message.fetchLanguage();
		if (typeof pattern === 'number') {
			if (!isNumber(pattern) || pattern <= 0) throw language.get(LanguageKeys.Resolvers.InvalidInt, { name: 'dice' });
			amount = pattern;
			dice = 6;
		} else {
			const results = this.kDice20RegExp.exec(pattern);
			if (results === null) throw language.get(LanguageKeys.Commands.Fun.DiceRollsError);
			amount = typeof results[1] === 'undefined' ? 1 : Number(results[1]);
			dice = Number(results[2]);

			if (amount <= 0 || amount > 1024) throw language.get(LanguageKeys.Commands.Fun.DiceRollsError);
			if (dice < 3 || dice > 1024) throw language.get(LanguageKeys.Commands.Fun.DiceSidesError);

			if (results[3].length > 0) {
				let modifierResults: RegExpExecArray | null = null;
				while ((modifierResults = this.kDice20TrailRegExp.exec(results[3]))) {
					if (modifierResults[1] === '+') {
						modifier += Number(modifierResults[2]);
					} else {
						modifier -= Number(modifierResults[2]);
					}
				}
			}
		}

		const maximum = amount * dice;
		const minimum = amount;
		return Math.floor(Math.random() * (maximum - minimum + 1) + minimum + modifier);
	}
}
