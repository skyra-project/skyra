import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { MessageEmbed } from 'discord.js';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['cf'],
			bucket: 2,
			cooldown: 7,
			description: language => language.tget('COMMAND_SLOTMACHINE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SLOTMACHINE_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000> <heads|tails>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [bet, guess]: [string, string]) {
		await message.author.settings.sync();
		const wager = Number(bet);
		const money = message.author.settings.get(UserSettings.Money);
		const resultEmbed = new MessageEmbed()
			.setColor(getColor(message));
		if (money < wager) {
			throw 'You can\'t wager more money than you have!';
		}

		const result = Math.random() > 0.5 ? 'heads' : 'tails';
		if (result === guess) {
			await message.author.settings.update(UserSettings.Money, money + wager);
			resultEmbed
				.setTitle('You won!')
				.setDescription(`The coin was flipped, and it showed ${result.charAt(0).toUpperCase() + result.slice(1)}! You won ${wager} shinies!`)
				.setThumbnail(`https://cdn.skyra.pw/img/coins/${result}.png`);
			return message.sendEmbed(resultEmbed);
		}
		await message.author.settings.update(UserSettings.Money, money - wager);
		resultEmbed
			.setTitle('You lost!')
			.setDescription(`The coin was flipped, and it showed ${result.charAt(0).toUpperCase() + result.slice(1)}. You lost ${wager} shinies.`)
			.setThumbnail(`https://cdn.skyra.pw/img/coins/${result}.png`);
		return message.sendEmbed(resultEmbed);
	}

}
