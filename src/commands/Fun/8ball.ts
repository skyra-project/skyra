import { codeBlock } from '@klasa/utils';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage, Language } from 'klasa';

const QUESTION_KEYS: (keyof EightBallLanguage)[] = ['HOW_MANY', 'HOW_MUCH', 'WHAT', 'WHEN', 'WHO', 'WHY'];

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_8BALL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_8BALL_EXTENDED'),
			spam: true,
			usage: '<question:string>'
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		return message.send(
			message.language.get('COMMAND_8BALL_OUTPUT', {
				author: message.author.toString(),
				question: input,
				response: codeBlock('', this.generator(input.toLowerCase(), message.language))
			}),
			{ disableEveryone: true }
		);
	}

	private generator(input: string, i18n: Language) {
		const prefixes = ((i18n.language.COMMAND_8BALL_QUESTIONS ||
			this.client.languages.default.language.COMMAND_8BALL_QUESTIONS) as unknown) as EightBallLanguage;

		for (const key of QUESTION_KEYS) {
			if (this.check(prefixes[key], input)) return i18n.get(`COMMAND_8BALL_${key}` as any);
		}
		return i18n.get('COMMAND_8BALL_ELSE');
	}

	private check(prefix: string | RegExp, input: string) {
		return prefix instanceof RegExp ? prefix.test(input) : input.startsWith(prefix);
	}
}

interface EightBallLanguage {
	WHEN: string | RegExp;
	WHAT: string | RegExp;
	HOW_MUCH: string | RegExp;
	HOW_MANY: string | RegExp;
	WHY: string | RegExp;
	WHO: string | RegExp;
}
