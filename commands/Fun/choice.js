const { Command } = require('klasa');
const { setToArray } = require.main.exports.util;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rng'],
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_CHOICE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_CHOICE_EXTENDED'),
			usage: '<words:string> [...]',
			usageDelim: ','
		});
		this.spam = true;
	}

	async run(msg, options) {
		const words = this.filterWords(options, msg.language);
		return msg.sendMessage(msg.language.get('COMMAND_CHOICE_OUTPUT',
			msg.author, words[Math.floor(Math.random() * words.length)]));
	}

	filterWords(words, i18n) {
		if (words.length < 2) throw i18n.get('COMMAND_CHOICE_MISSING');

		const output = new Set();
		const filtered = new Set();
		for (const raw of words) {
			const word = raw.trim();
			if (!word) continue;
			if (!output.has(word)) output.add(word);
			else filtered.add(word);
		}

		if (output.size >= 2) return setToArray(output);
		throw i18n.get('COMMAND_CHOICE_DUPLICATES', setToArray(filtered).join('\', \''));
	}

};
