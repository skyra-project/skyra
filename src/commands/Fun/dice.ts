import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { isNumber } from '@sapphire/utilities';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['roll'],
	description: LanguageKeys.Commands.Fun.DiceDescription,
	detailedDescription: LanguageKeys.Commands.Fun.DiceExtended
})
export class UserCommand extends SkyraCommand {
	/**
	 * Syntax  : {number}?[ ]d[ ]{number}[ ]{.*?}
	 * Examples:
	 *  - 4d6
	 *  - d20
	 *  - 2d8+2
	 *  - 1d10*10
	 */
	private readonly kDice20RegExp = /^(\d+)?\s*d\s*(\d+)\s*(.*?)$/;

	/**
	 * Syntax  : {+-}[ ]{number}
	 * Examples:
	 *  - +20
	 *  - -50
	 *  - + 70
	 *  - *10
	 */
	private readonly kDice20TrailRegExp = /([+-x*])\s*(\d+)/g;

	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		const amountOrDice = args.finished ? 6 : await args.pick('integer', { minimum: 1, maximum: 1024 }).catch(() => args.rest('string'));
		const content = args.t(LanguageKeys.Commands.Fun.DiceOutput, { result: this.roll(amountOrDice) });
		return send(message, content);
	}

	private roll(pattern: string | number) {
		if (typeof pattern === 'number') {
			if (!isNumber(pattern) || pattern < 3) this.error(LanguageKeys.Serializers.InvalidInt, { name: 'dice' });
			return this.generateNumber(1, pattern);
		}

		const results = this.kDice20RegExp.exec(pattern);
		if (results === null) this.error(LanguageKeys.Commands.Fun.DiceRollsError);

		const amount = typeof results[1] === 'undefined' ? 1 : Number(results[1]);
		if (amount < 1 || amount > 1024) this.error(LanguageKeys.Commands.Fun.DiceRollsError);

		const dice = Number(results[2]);
		if (dice < 3 || dice > 1024) this.error(LanguageKeys.Commands.Fun.DiceSidesError);

		let result = this.generateNumber(amount, amount * dice);
		if (results[3].length > 0) result = this.processModifiers(result, results[3]);

		return result;
	}

	private generateNumber(minimum: number, maximum: number) {
		return Math.floor(Math.random() * (maximum - minimum + 1) + minimum);
	}

	private processModifiers(output: number, modifiers: string) {
		let modifierResults: RegExpExecArray | null = null;
		while ((modifierResults = this.kDice20TrailRegExp.exec(modifiers))) {
			output = this.processModifier(output, modifierResults);
		}

		return output;
	}

	private processModifier(output: number, modifierResults: RegExpExecArray) {
		const value = Number(modifierResults[2]);
		switch (modifierResults[1] as '+' | '-' | '*' | 'x') {
			case '+':
				return output + value;
			case '-':
				return output - value;
			case 'x':
			case '*':
				return output * value;
		}
	}
}
