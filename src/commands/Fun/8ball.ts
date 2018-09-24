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

		if (this.check(prefixes.HOW_MANY, input)) return this.generate(QuestionTypes.HowMany, i18n);
		if (this.check(prefixes.HOW_MUCH, input)) return this.generate(QuestionTypes.HowMuch, i18n);
		if (this.check(prefixes.WHAT, input)) return this.generate(QuestionTypes.What, i18n);
		if (this.check(prefixes.WHEN, input)) return this.generate(QuestionTypes.When, i18n);
		if (this.check(prefixes.WHO, input)) return this.generate(QuestionTypes.Who, i18n);
		if (this.check(prefixes.WHY, input)) return this.generate(QuestionTypes.Why, i18n);
		return this.generate(QuestionTypes.Else, i18n);
	}

	generate(type, i18n) {
		const row = i18n.EIGHT_BALL[type];
		return row[Math.floor(Math.random() * row.length)];
	}

	checkQuestion(question, input) {
		return question instanceof RegExp ? question.test(input) : input.endsWith(question);
	}

	check(prefix, input) {
		return prefix instanceof RegExp ? prefix.test(input) : input.startsWith(prefix);
	}

};

const QuestionTypes = {
	HowMany: 'HOWMANY',
	HowMuch: 'HOWMUCH',
	What: 'WHAT',
	When: 'WHEN',
	Who: 'WHO',
	Why: 'WHY',
	Else: 'ELSE'
};
