import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '#root/config';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { oneToTen } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
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
	private devRegex = new RegExp(`^(kyra|favna|${[...this.client.owners].map((owner) => `<@!${owner.id}>`).join('|')})$`, 'i');
	private botRegex = new RegExp(`^(you|yourself|skyra|<@!${CLIENT_ID}>)$`, 'i');

	public async run(message: KlasaMessage, [user]: [string]) {
		// Escape all markdown
		user = escapeMarkdown(user);
		const language = await message.fetchLanguage();

		let ratewaifu: string | undefined = undefined;
		let rate: number | undefined = undefined;

		if (this.botRegex.test(user)) {
			rate = 100;
			[ratewaifu, user] = language.get(LanguageKeys.Commands.Fun.RateMyself);
		} else if (this.devRegex.test(user)) {
			rate = 101;
			[ratewaifu, user] = language.get(LanguageKeys.Commands.Fun.RateMyOwners);
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
