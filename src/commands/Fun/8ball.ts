import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { pickRandom } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { codeBlock } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';

const QUESTION_KEYS: (keyof EightBallLanguage)[] = ['HowMany', 'HowMuch', 'What', 'When', 'Who', 'Why'];

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.EightballDescription,
	detailedDescription: LanguageKeys.Commands.Fun.EightballExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const question = await args.rest('string', { maximum: 500 });

		const content = args.t(LanguageKeys.Commands.Fun.EightballOutput, {
			author: message.author.toString(),
			question,
			response: codeBlock('', this.generator(question.toLowerCase(), args.t))
		});
		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}

	private generator(input: string, t: TFunction) {
		const prefixes = t(LanguageKeys.Commands.Fun.EightballQuestions);

		for (const key of QUESTION_KEYS) {
			if (this.check(prefixes[key], input)) {
				return pickRandom(t(LanguageKeys.Commands.Fun.Resolve8BallQuestionKey(key)));
			}
		}
		return pickRandom(t(LanguageKeys.Commands.Fun.EightballElse));
	}

	private check(prefix: string, input: string) {
		let regexpOrPrefix: string | RegExp = prefix;

		// If the prefix starts with a ^ then create a RegExp from it
		if (regexpOrPrefix.startsWith('^')) regexpOrPrefix = new RegExp(regexpOrPrefix, 'i');

		return regexpOrPrefix instanceof RegExp ? regexpOrPrefix.test(input) : input.startsWith(regexpOrPrefix);
	}
}

export interface EightBallLanguage {
	When: string;
	What: string;
	HowMuch: string;
	HowMany: string;
	Why: string;
	Who: string;
}
