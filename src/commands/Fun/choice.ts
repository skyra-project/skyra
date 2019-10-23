import { KlasaMessage, Language } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { ApplyOptions } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['choose', 'choise', 'pick'],
	bucket: 2,
	cooldown: 10,
	description: language => language.tget('COMMAND_CHOICE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_CHOICE_EXTENDED'),
	usage: '<words:string> [...]',
	usageDelim: ',',
	spam: true
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, options: string[]) {
		const words = this.filterWords(options, message.language);
		return message.sendLocale('COMMAND_CHOICE_OUTPUT',
			[message.author, words[Math.floor(Math.random() * words.length)]]);
	}

	private filterWords(words: string[], i18n: Language) {
		if (words.length < 2) throw i18n.tget('COMMAND_CHOICE_MISSING');

		const output = new Set();
		const filtered = new Set();
		for (const raw of words) {
			const word = raw.trim();
			if (!word) continue;
			if (output.has(word)) filtered.add(word);
			else output.add(word);
		}

		if (output.size >= 2) return [...output];
		throw i18n.tget('COMMAND_CHOICE_DUPLICATES', [...filtered].join('\', \''));
	}

}
