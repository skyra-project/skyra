import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { MessageEmbed } from 'discord.js';
import { getColor } from '../../lib/util/util';

const HEADS_IMAGE = 'https://camo.githubusercontent.com/54e9b61b351bbaf60be7559869e9d5f86808dfd5/68747470733a2f2f73746f726167652e676f6f676c65617069732e636f6d2f646174612d73756e6c696768742d3134363331332e61707073706f742e636f6d2f726962626f6e2f646e6468656164732e706e67';
const TAILS_IMAGE = 'https://camo.githubusercontent.com/a1a9b13ceafcebe5e0be546065859b733d069443/68747470733a2f2f73746f726167652e676f6f676c65617069732e636f6d2f646174612d73756e6c696768742d3134363331332e61707073706f742e636f6d2f726962626f6e2f646e647461696c732e706e67';
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
			throw 'You can\'t wager more money than you have!'
		}

		const result = Math.random() > 0.5 ? 'heads' : 'tails';
		if (result === guess) {
			await message.author.settings.update(UserSettings.Money, money + wager);
			resultEmbed
				.setTitle('You won!')
				.setDescription(`The coin was flipped, and it showed ${result.charAt(0).toUpperCase() + result.slice(1)}! You won ${wager} shinies!`)
				.setThumbnail(guess === 'heads' ? HEADS_IMAGE : TAILS_IMAGE);
			return message.sendEmbed(resultEmbed);
		}
		await message.author.settings.update(UserSettings.Money, money - wager);
		resultEmbed
			.setTitle('You lost!')
			.setDescription(`The coin was flipped, and it showed ${result.charAt(0).toUpperCase() + result.slice(1)}. You lost ${wager} shinies.`)
			.setThumbnail(guess === 'heads' ? HEADS_IMAGE : TAILS_IMAGE);
		return message.sendEmbed(resultEmbed);
	}

}
