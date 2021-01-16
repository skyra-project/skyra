import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['choose', 'choise', 'pick'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.ChoiceDescription,
	extendedHelp: LanguageKeys.Commands.Fun.ChoiceExtended,
	usage: '<words:string> [...]',
	usageDelim: ',',
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: Message, options: string[]) {
		const t = await message.fetchT();
		const words = await this.filterWords(t, options);
		return message.send(
			t(LanguageKeys.Commands.Fun.ChoiceOutput, {
				user: message.author.toString(),
				word: words[Math.floor(Math.random() * words.length)]
			})
		);
	}

	private async filterWords(t: TFunction, words: string[]) {
		if (words.length < 2) throw t(LanguageKeys.Commands.Fun.ChoiceMissing);

		const output = new Set<string>();
		const filtered = new Set<string>();
		for (const raw of words) {
			const word = raw.trim();
			if (!word) continue;
			if (output.has(word)) filtered.add(word);
			else output.add(word);
		}

		if (output.size >= 2) return [...output];
		throw t(LanguageKeys.Commands.Fun.ChoiceDuplicates, { words: [...filtered].join("', '") });
	}
}
