import { CommandStore, KlasaClient, KlasaMessage, Language, util } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_8BALL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_8BALL_EXTENDED'),
			spam: true,
			usage: '<question:string>'
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		return message.sendLocale('COMMAND_8BALL_OUTPUT',
			[message.author, input, util.codeBlock('', this.generator(input.toLowerCase(), message.language))],
			{ disableEveryone: true });
	}

	private generator(input: string, i18n: Language) {
		const prefixes = <unknown> (i18n.language.COMMAND_8BALL_QUESTIONS
			|| this.client.languages.default.language.COMMAND_8BALL_QUESTIONS) as EightBallLanguage;

		if (!this.checkQuestion(prefixes.QUESTION || '?', input))
			throw i18n.get('COMMAND_8BALL_NOT_QUESTION');

		for (const key of QUESTION_KEYS)
			if (this.check(prefixes[key], input)) return i18n.get(`COMMAND_8BALL_${key}`);
		return i18n.get('COMMAND_8BALL_ELSE');
	}

	private checkQuestion(question: string | RegExp, input: string) {
		return question instanceof RegExp ? question.test(input) : input.endsWith(question);
	}

	private check(prefix: string | RegExp, input: string) {
		return prefix instanceof RegExp ? prefix.test(input) : input.startsWith(prefix);
	}

}

const QUESTION_KEYS = ['HOW_MANY', 'HOW_MUCH', 'WHAT', 'WHEN', 'WHO', 'WHY'];

interface EightBallLanguage {
	QUESTION: string | RegExp;
	WHEN: string | RegExp;
	WHAT: string | RegExp;
	HOW_MUCH: string | RegExp;
	HOW_MANY: string | RegExp;
	WHY: string | RegExp;
	WHO: string | RegExp;
}
