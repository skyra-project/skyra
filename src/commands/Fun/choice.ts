import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['choose', 'choise', 'pick'],
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Fun.ChoiceDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.ChoiceExtended),
	usage: '<words:string> [...]',
	usageDelim: ',',
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, options: string[]) {
		const words = await this.filterWords(message, options);
		return message.sendLocale(LanguageKeys.Commands.Fun.ChoiceOutput, [
			{
				user: message.author.toString(),
				word: words[Math.floor(Math.random() * words.length)]
			}
		]);
	}

	private async filterWords(message: KlasaMessage, words: string[]) {
		const i18n = await message.fetchLanguage();
		if (words.length < 2) throw i18n.get(LanguageKeys.Commands.Fun.ChoiceMissing);

		const output = new Set<string>();
		const filtered = new Set<string>();
		for (const raw of words) {
			const word = raw.trim();
			if (!word) continue;
			if (output.has(word)) filtered.add(word);
			else output.add(word);
		}

		if (output.size >= 2) return [...output];
		throw i18n.get(LanguageKeys.Commands.Fun.ChoiceDuplicates, { words: [...filtered].join("', '") });
	}
}
