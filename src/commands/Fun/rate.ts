import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { escapeMarkdown } from '@utils/External/escapeMarkdown';
import { oneToTen } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('commandRateDescription'),
			extendedHelp: (language) => language.get('commandRateExtended'),
			spam: true,
			usage: '<user:string>'
		});
	}

	public async run(message: KlasaMessage, [user]: [string]) {
		// Escape all markdown
		user = escapeMarkdown(user);

		let ratewaifu: string | undefined = undefined;
		let rate: number | undefined = undefined;

		if (/^(you|yourself|skyra)$/i.test(user)) {
			rate = 100;
			[ratewaifu, user] = message.language.get('commandRateMyself');
		} else {
			user = /^(myself|me)$/i.test(user) ? message.author.username : user.replace(/\bmy\b/g, 'your');

			const rng = Math.round(Math.random() * 100);
			[ratewaifu, rate] = [oneToTen((rng / 10) | 0)!.emoji, rng];
		}

		return message.sendLocale('commandRateOutput', [{ author: message.author.username, userToRate: user, rate, emoji: ratewaifu }], {
			disableEveryone: true
		});
	}
}
