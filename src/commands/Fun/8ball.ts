import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { codeBlock } from '@sapphire/utilities';
import { CommandStore, KlasaMessage, Language } from 'klasa';

const QUESTION_KEYS: (keyof EightBallLanguage)[] = ['howMany', 'howMuch', 'what', 'when', 'who', 'why'];

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
			{ disableEveryone: true }
		);
	}

	private generator(input: string, i18n: Language) {
		const prefixes = ((i18n.language.command8ballQuestions ||
			this.client.languages.default.language.command8ballQuestions) as unknown) as EightBallLanguage;

		for (const key of QUESTION_KEYS) {
			if (this.check(prefixes[key], input)) return i18n.get(`command8ball${key}` as any);
		}
		return i18n.get('command8ballElse');
	}

	private check(prefix: string | RegExp, input: string) {
		return prefix instanceof RegExp ? prefix.test(input) : input.startsWith(prefix);
	}
}

interface EightBallLanguage {
	when: string | RegExp;
	what: string | RegExp;
	howMuch: string | RegExp;
	howMany: string | RegExp;
	why: string | RegExp;
	who: string | RegExp;
}
