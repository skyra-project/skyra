import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CLIENT_ID, OWNERS } from '#root/config';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { oneToTen } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Fun.RateDescription,
	extendedHelp: LanguageKeys.Commands.Fun.RateExtended,
	spam: true,
	usage: '<user:string>'
})
export default class extends SkyraCommand {
	private devRegex = new RegExp(`^(kyra|favna|${OWNERS.map((owner) => `<@!${owner}>`).join('|')})$`, 'i');
	private botRegex = new RegExp(`^(you|yourself|skyra|<@!${CLIENT_ID}>)$`, 'i');

	public async run(message: Message, [user]: [string]) {
		// Escape all markdown
		user = escapeMarkdown(user);
		const t = await message.fetchT();

		let ratewaifu: string | undefined = undefined;
		let rate: number | undefined = undefined;

		if (this.botRegex.test(user)) {
			rate = 100;
			[ratewaifu, user] = t(LanguageKeys.Commands.Fun.RateMyself);
		} else if (this.devRegex.test(user)) {
			rate = 101;
			[ratewaifu, user] = t(LanguageKeys.Commands.Fun.RateMyOwners);
		} else {
			user = /^(myself|me)$/i.test(user) ? message.author.username : user.replace(/\bmy\b/g, 'your');

			const rng = Math.round(Math.random() * 100);
			[ratewaifu, rate] = [oneToTen((rng / 10) | 0)!.emoji, rng];
		}

		return message.send(t(LanguageKeys.Commands.Fun.RateOutput, { author: message.author.username, userToRate: user, rate, emoji: ratewaifu }), {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
