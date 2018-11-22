import { Command } from '../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['choise', 'pick'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_CHOICE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CHOICE_EXTENDED'),
			usage: '<words:string> [...]',
			usageDelim: ','
		});
		this.spam = true;
	}

	public async run(msg, options) {
		const words = this.filterWords(options, msg.language);
		return msg.sendLocale('COMMAND_CHOICE_OUTPUT',
			[msg.author, words[Math.floor(Math.random() * words.length)]]);
	}

	public filterWords(words, i18n) {
		if (words.length < 2) throw i18n.get('COMMAND_CHOICE_MISSING');

		const output = new Set();
		const filtered = new Set();
		for (const raw of words) {
			const word = raw.trim();
			if (!word) continue;
			if (!output.has(word)) output.add(word);
			else filtered.add(word);
		}

		if (output.size >= 2) return [...output];
		throw i18n.get('COMMAND_CHOICE_DUPLICATES', [...filtered].join('\', \''));
	}

}
