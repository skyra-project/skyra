import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['choose', 'choise', 'pick'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('commandChoiceDescription'),
			extendedHelp: (language) => language.get('commandChoiceExtended'),
			usage: '<words:string> [...]',
			usageDelim: ',',
			spam: true
		});
	}

	public async run(message: KlasaMessage, options: string[]) {
		const words = this.filterWords(message, options);
		return message.sendLocale('commandChoiceOutput', [
			{
				user: message.author.toString(),
				word: words[Math.floor(Math.random() * words.length)]
			}
		]);
	}

	private filterWords(message: KlasaMessage, words: string[]) {
		const i18n = message.language;
		if (words.length < 2) throw i18n.get('commandChoiceMissing');

		const output = new Set<string>();
		const filtered = new Set<string>();
		for (const raw of words) {
			const word = raw.trim();
			if (!word) continue;
			if (output.has(word)) filtered.add(word);
			else output.add(word);
		}

		if (output.size >= 2) return [...output];
		throw i18n.get('commandChoiceDuplicates', { words: [...filtered].join("', '") });
	}
}
