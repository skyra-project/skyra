import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { cast, pickRandom } from '#utils/util';
import { codeBlock } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { TFunction } from 'i18next';
import { KlasaMessage } from 'klasa';

const QUESTION_KEYS: (keyof EightBallLanguage)[] = ['HowMany', 'HowMuch', 'What', 'When', 'Who', 'Why'];

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.EightballDescription,
	extendedHelp: LanguageKeys.Commands.Fun.EightballExtended,
	spam: true,
	usage: '<question:string>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [input]: [string]) {
		const t = await message.fetchT();
		return message.send(
			t(LanguageKeys.Commands.Fun.EightballOutput, {
				author: message.author.toString(),
				question: input,
				response: codeBlock('', this.generator(input.toLowerCase(), t))
			}),
			{ allowedMentions: { users: [], roles: [] } }
		);
	}

	private generator(input: string, t: TFunction) {
		const prefixes = cast<EightBallLanguage>(t(LanguageKeys.Commands.Fun.EightballQuestions));

		for (const key of QUESTION_KEYS) {
			if (this.check(prefixes[key], input)) {
				return pickRandom(t(LanguageKeys.Commands.Fun.Resolve8BallQuestionKey(key), { returnObjects: true }));
			}
		}
		return pickRandom(t(LanguageKeys.Commands.Fun.EightballElse, { returnObjects: true }));
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
