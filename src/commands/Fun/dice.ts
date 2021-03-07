import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { isNumber } from '@sapphire/utilities';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['roll'],
	cooldown: 5,
	description: LanguageKeys.Commands.Fun.DiceDescription,
	extendedHelp: LanguageKeys.Commands.Fun.DiceExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
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

	public async run(message: Message, args: SkyraCommand.Args) {
		const amountOrDice = await args.pick('integer', { minimum: 1, maximum: 1024 }).catch(() => args.rest('string'));
		return message.send(args.t(LanguageKeys.Commands.Fun.DiceOutput, { result: await this.roll(amountOrDice) }));
	}

	private async roll(pattern: string | number) {
		let amount: number | undefined = undefined;
		let dice: number | undefined = undefined;
		let modifier = 0;
		if (typeof pattern === 'number') {
			if (!isNumber(pattern) || pattern <= 0) this.error(LanguageKeys.Serializers.InvalidInt, { name: 'dice' });
			amount = 1;
			dice = 6;
		} else {
			const results = this.kDice20RegExp.exec(pattern);
			if (results === null) this.error(LanguageKeys.Commands.Fun.DiceRollsError);
			amount = typeof results[1] === 'undefined' ? 1 : Number(results[1]);
			dice = Number(results[2]);

			if (amount <= 1 || amount > 1024) this.error(LanguageKeys.Commands.Fun.DiceRollsError);
			if (dice < 3 || dice > 1024) this.error(LanguageKeys.Commands.Fun.DiceSidesError);

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
