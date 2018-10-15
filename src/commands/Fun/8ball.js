const { Command, klasaUtil: { codeBlock } } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_8BALL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_8BALL_EXTENDED'),
			usage: '<question:string>'
		});
		this.spam = true;
	}

	async run(msg, [input]) {
		return msg.sendLocale('COMMAND_8BALL_OUTPUT',
			[msg.author, input, codeBlock('', this.generator(input.toLowerCase(), msg.language))],
			{ disableEveryone: true });
	}

	generator(input, i18n) {
		const prefixes = i18n.language.COMMAND_8BALL_QUESTIONS
			|| this.client.languages.default.language.COMMAND_8BALL_QUESTIONS;

		if (!this.checkQuestion(prefixes.QUESTION || '?', input))
			throw i18n.get('COMMAND_8BALL_NOT_QUESTION');

		for (const key of QUESTION_KEYS)
			if (this.check(prefixes[key])) return i18n.get(`COMMAND_8BALL_${key}`);
		return i18n.get('COMMAND_8BALL_ELSE');
	}

	checkQuestion(question, input) {
		return question instanceof RegExp ? question.test(input) : input.endsWith(question);
	}

	check(prefix, input) {
		return prefix instanceof RegExp ? prefix.test(input) : input.startsWith(prefix);
	}

};

const QUESTION_KEYS = ['HOW_MANY', 'HOW_MUCH', 'WHAT', 'WHEN', 'WHO', 'WHY'];
