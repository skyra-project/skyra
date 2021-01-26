import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['choose', 'choise', 'pick'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.ChoiceDescription,
	extendedHelp: LanguageKeys.Commands.Fun.ChoiceExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const options = (await args.rest('string')).split(',');

		const words = await this.filterWords(args.t, options);
		return message.send(
			args.t(LanguageKeys.Commands.Fun.ChoiceOutput, { user: message.author.toString(), word: words[Math.floor(Math.random() * words.length)] })
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
