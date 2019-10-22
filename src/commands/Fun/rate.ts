import { Util } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { oneToTen } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_RATE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_RATE_EXTENDED'),
			spam: true,
			usage: '<user:string>'
		});
	}

	public async run(message: KlasaMessage, [user]: [string]) {
		// Escape all markdown
		user = Util.escapeMarkdown(user);

		let ratewaifu;
		let rate;

		if (/^(you|yourself|skyra)$/i.test(user)) {
			rate = 100;
			[ratewaifu, user] = message.language.tget('COMMAND_RATE_MYSELF');
		} else {
			user = /^(myself|me)$/i.test(user)
				? message.author!.username
				: user.replace(/\bmy\b/g, 'your');

			const rng = Math.round(Math.random() * 100);
			[ratewaifu, rate] = [oneToTen((rng / 10) | 0)!.emoji, rng];
		}

		return message.sendMessage(`**${message.author!.username}**, ${message.language.tget('COMMAND_RATE_OUTPUT', user, rate, ratewaifu)}`, { disableEveryone: true });
	}

}
