import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { cast, pickRandom } from '#utils/util';
import { codeBlock } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage, Language } from 'klasa';

const QUESTION_KEYS: (keyof EightBallLanguage)[] = ['HowMany', 'HowMuch', 'What', 'When', 'Who', 'Why'];

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Fun.EightballDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.EightballExtended),
	spam: true,
	usage: '<question:string>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [input]: [string]) {
		return message.sendLocale(
			LanguageKeys.Commands.Fun.EightballOutput,
			[
				{
					author: message.author.toString(),
					question: input,
					response: codeBlock('', this.generator(input.toLowerCase(), await message.fetchLanguage()))
				}
			],
			{ allowedMentions: { users: [], roles: [] } }
		);
	}

	private generator(input: string, i18n: Language) {
		const prefixes = cast<EightBallLanguage>(i18n.get(LanguageKeys.Commands.Fun.EightballQuestions));

		for (const key of QUESTION_KEYS) {
			if (this.check(prefixes[key], input)) return pickRandom(i18n.get(LanguageKeys.Commands.Fun.Resolve8BallQuestionKey(key)));
		}
		return pickRandom(i18n.get(LanguageKeys.Commands.Fun.EightballElse));
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
