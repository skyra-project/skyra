import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { codeBlock } from '@sapphire/utilities';
import { cast, pickRandom } from '@utils/util';
import { CommandStore, KlasaMessage, Language, LanguageKeysSimple } from 'klasa';

const QUESTION_KEYS: (keyof EightBallLanguage)[] = ['HowMany', 'HowMuch', 'What', 'When', 'Who', 'Why'];

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('command8ballDescription'),
			extendedHelp: (language) => language.get('command8ballExtended'),
			spam: true,
			usage: '<question:string>'
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		return message.sendLocale(
			'command8ballOutput',
			[
				{
					author: message.author.toString(),
					question: input,
					response: codeBlock('', this.generator(input.toLowerCase(), message.language))
				}
			],
			{ allowedMentions: { users: [], roles: [] } }
		);
	}

	private generator(input: string, i18n: Language) {
		const prefixes = cast<EightBallLanguage>(i18n.language.command8ballQuestions || this.client.languages.default.language.command8ballQuestions);

		for (const key of QUESTION_KEYS) {
			if (this.check(prefixes[key], input)) return pickRandom(i18n.get(`command8ball${key}` as ReplyTypes));
		}
		return pickRandom(i18n.get('command8ballElse'));
	}

	private check(prefix: string, input: string) {
		let regexpOrPrefix: string | RegExp = prefix;

		// If the prefix starts with a ^ then create a RegExp from it
		if (regexpOrPrefix.startsWith('^')) regexpOrPrefix = new RegExp(regexpOrPrefix, 'i');

		return regexpOrPrefix instanceof RegExp ? regexpOrPrefix.test(input) : input.startsWith(regexpOrPrefix);
	}
}

// TODO: Utilize template strings in types when available
type ReplyTypes = Extract<
	LanguageKeysSimple,
	'command8ballWhen' | 'command8ballWhat' | 'command8ballHowMuch' | 'command8ballHowMany' | 'command8ballWhy' | 'command8ballWho'
>;

export interface EightBallLanguage {
	When: string;
	What: string;
	HowMuch: string;
	HowMany: string;
	Why: string;
	Who: string;
}
