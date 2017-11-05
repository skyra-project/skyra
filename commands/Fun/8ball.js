const { structures: { Command }, util: { util } } = require('../../index');

const startsWith = (prefix, str) => {
	for (let i = prefix.length - 1; i >= 0; i--) if (str[i] !== prefix[i]) return false;
	return true;
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			spam: true,

			cooldown: 10,

			usage: '<question:string>',
			description: 'Skyra will read the Holy Bible to find the correct answer for your question.',
			extend: {
				EXPLANATION: 'This command provides you a random question based on your questions\' type. Be careful, it may be too smart.',
				ARGUMENTS: '<question>',
				EXP_USAGE: [
					['question', 'The Holy Question.']
				],
				EXAMPLES: [
					'Why did the chicken cross the road?'
				]
			}
		});
	}

	async run(msg, [input], settings, i18n) {
		return msg.send(i18n.get('COMMAND_8BALL', msg.author, input, util.codeBlock('', this.generator(input, i18n))));
	}

	generate(type, i18n) {
		const row = i18n.EIGHT_BALL[type];
		return row[Math.floor(Math.random() * row.length)];
	}

	generator(input, i18n) {
		const prefixes = i18n.language.COMMAND_8BALL_QUESTIONS || this.client.languages.get('en-US').language.COMMAND_8BALL_QUESTIONS;

		input = input.toLowerCase();
		if (this.checkQuestion(prefixes.QUESTION || '?', input) === false)
			throw i18n.get('COMMAND_8BALL_NOT_QUESTION');

		if (this.check(prefixes.WHEN, input)) return this.generate('WHEN', i18n);
		if (this.check(prefixes.WHAT, input)) return this.generate('WHAT', i18n);
		if (this.check(prefixes.HOW_MUCH, input)) return this.generate('HOWMUCH', i18n);
		if (this.check(prefixes.HOW_MANY, input)) return this.generate('HOWMANY', i18n);
		if (this.check(prefixes.WHY, input)) return this.generate('WHY', i18n);
		if (this.check(prefixes.WHO, input)) return this.generate('WHO', i18n);
		return this.generate('ELSE', i18n);
	}

	check(prefix, input) {
		return prefix instanceof RegExp ? prefix.test(input) : startsWith(prefix, input);
	}

	checkQuestion(question, input) {
		return question instanceof RegExp ? question.test(input) : input.endsWith(question);
	}

};
