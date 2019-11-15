import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { MessageEmbed } from 'discord.js';
import { getColor } from '../../lib/util/util';

enum CoinTypes { Heads, Tails }
export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['cf'],
			bucket: 2,
			cooldown: 7,
			description: language => language.tget('COMMAND_COINFLIP_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_COINFLIP_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000> <coin:cointype>',
			usageDelim: ' '
		});

		this.createCustomResolver('cointype', (arg, possible, message) => {
			const coinNames = message.language.tget('COMMAND_COINFLIP_COINNAMES').map(e => e.toLowerCase());
			if (!coinNames.includes(arg.toLowerCase())) throw message.language.tget('COMMAND_COINFLIP_INVALID_COINNAME', arg);
			return arg.toLowerCase() === coinNames[0] ? CoinTypes.Heads : CoinTypes.Tails;
		});
	}

	public async run(message: KlasaMessage, [bet, guess]: [string, CoinTypes]) {
		await message.author.settings.sync();
		const wager = Number(bet);
		const money = message.author.settings.get(UserSettings.Money);

		if (money < wager) {
			throw 'You can\'t wager more money than you have!';
		}

		const embed = new MessageEmbed()
			.setColor(getColor(message));
		const result = Math.random() > 0.5 ? CoinTypes.Heads : CoinTypes.Tails;

		console.log(result, guess);
		const updatedBalance = result === guess ? money + wager : money - wager;

		const coinNames = message.language.tget('COMMAND_COINFLIP_COINNAMES');
		await message.author.settings.update(UserSettings.Money, updatedBalance);
		embed
			.setTitle(message.language.tget(result === guess ? 'COMMAND_COINFLIP_WIN_TITLE' : 'COMMAND_COINFLIP_LOSE_TITLE'))
			.setDescription(message.language.tget(result === guess ? 'COMMAND_COINFLIP_WIN_DESCRIPTION' : 'COMMAND_COINFLIP_LOSE_DESCRIPTION', coinNames[result], wager))
			.setThumbnail(`https://cdn.skyra.pw/img/coins/${coinNames[result].toLowerCase()}.png`);
		return message.sendEmbed(embed);
	}

}
