import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { escapeMarkdown } from '@utils/External/escapeMarkdown';
import { oneToTen } from '@utils/util';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Fun.RateDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.RateExtended),
	spam: true,
	usage: '<user:string>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [user]: [string]) {
		// Escape all markdown
		user = escapeMarkdown(user);

		let ratewaifu: string | undefined = undefined;
		let rate: number | undefined = undefined;

		if (/^(you|yourself|skyra)$/i.test(user)) {
			rate = 100;
			[ratewaifu, user] = message.language.get(LanguageKeys.Commands.Fun.RateMyself);
		} else {
			user = /^(myself|me)$/i.test(user) ? message.author.username : user.replace(/\bmy\b/g, 'your');

			const rng = Math.round(Math.random() * 100);
			[ratewaifu, rate] = [oneToTen((rng / 10) | 0)!.emoji, rng];
		}

		return message.sendLocale(
			LanguageKeys.Commands.Fun.RateOutput,
			[{ author: message.author.username, userToRate: user, rate, emoji: ratewaifu }],
			{
				allowedMentions: { users: [], roles: [] }
			}
		);
	}
}
