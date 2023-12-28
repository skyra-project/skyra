import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { OWNERS } from '#root/config';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { oneToTen } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.RateDescription,
	detailedDescription: LanguageKeys.Commands.Fun.RateExtended
})
export class UserCommand extends SkyraCommand {
	private devRegex = new RegExp(`^(kyra|favna|${OWNERS.map((owner) => `<@!?${owner}>`).join('|')})$`, 'i');
	private botRegex = new RegExp(`^(you|yourself|skyra|<@!${process.env.CLIENT_ID}>)$`, 'i');

	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		// Escape all markdown
		let rateableThing = await args.rest('string');

		let ratewaifu: string;
		let rate: number;

		if (this.botRegex.test(rateableThing)) {
			rate = 100;
			[ratewaifu, rateableThing] = args.t(LanguageKeys.Commands.Fun.RateMyself);
		} else if (this.devRegex.test(rateableThing)) {
			rate = 101;
			[ratewaifu, rateableThing] = args.t(LanguageKeys.Commands.Fun.RateMyOwners);
		} else {
			rateableThing = /^(myself|me)$/i.test(rateableThing)
				? message.author.displayName
				: escapeMarkdown(rateableThing.replace(/\bmy\b/g, 'your'));

			const rng = Math.round(Math.random() * 100);
			[ratewaifu, rate] = [oneToTen((rng / 10) | 0)!.emoji, rng];
		}

		const content = args.t(LanguageKeys.Commands.Fun.RateOutput, {
			author: message.author.displayName,
			userToRate: rateableThing,
			rate,
			emoji: ratewaifu
		});
		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}
}
