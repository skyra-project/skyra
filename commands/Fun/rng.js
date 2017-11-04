const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['choice'],
			spam: true,

			cooldown: 10,

			usage: '<words:string> [...]',
			usageDelim: ',',
			description: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
			extend: {
				EXPLANATION: [
					'I have an existencial doubt... should I wash the dishes or throw them throught the window? The search',
					'continues. List me items separated by `\', \'` and I will choose one them. On a side note, I am not',
					'responsible of what happens next.'
				].join(' '),
				ARGUMENTS: '<words>',
				EXP_USAGE: [
					['words', 'A list of words separated by comma and space.']
				],
				EXAMPLES: [
					'Should Wash the dishes, Throw the dishes throught the window',
					'Cat, Dog'
				]
			}
		});
	}

	async run(msg, [...options], settings, i18n) {
		const words = this.filterWords(options, i18n);
		return msg.send(i18n.get('COMMAND_RNG', msg.author, words[Math.floor(Math.random() * words.length)]));
	}

	filterWords(words, i18n) {
		if (words.length < 2) throw i18n.get('COMMAND_RNG_MISSING');

		const output = [];
		const filtered = [];
		for (let i = 0; i < words.length; i++) {
			const word = words[i].trim();
			if (word === '') continue;
			if (!output.includes(word)) output.push(word);
			else filtered.push(word);
		}

		if (output.length < 2) throw i18n.get('COMMAND_RNG_DUP', filtered.join('\', \''));

		return output;
	}

};
