import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { MessageEmbed } from 'discord.js';
import { getColor, cleanMentions } from '../../lib/util/util';

const enum CoinType { Heads, Tails }
export default class extends SkyraCommand {

	private readonly cdnTypes = ['heads', 'tails'] as const;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['cf'],
			bucket: 2,
			cooldown: 7,
			description: language => language.tget('COMMAND_COINFLIP_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_COINFLIP_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '(coin:cointype) <50|100|200|500|1000|2000|5000|10000|cashless:default>',
			usageDelim: ' '
		});

		this.createCustomResolver('cointype', (arg, _possible, message) => {
			if (!arg) return null;
			const lArg = arg.toLowerCase();
			const face = message.language.tget('COMMAND_COINFLIP_COINNAMES').findIndex(coin => coin.toLowerCase() === lArg);
			if (face === -1) throw message.language.tget('COMMAND_COINFLIP_INVALID_COINNAME', cleanMentions(message.guild!, arg));
			return face;
		});
	}

	public async run(message: KlasaMessage, [guess, bet]: [CoinType | null, string]) {
		if (guess === null) return this.noGuess(message);
		if (bet === 'cashless') return this.cashless(message, guess!);

		await message.author.settings.sync();
		const wager = Number(bet);
		const money = message.author.settings.get(UserSettings.Money);

		if (money < wager) {
			throw message.language.tget('COMMAND_SLOTMACHINES_MONEY', money);
		}

		const coinNames = message.language.tget('COMMAND_COINFLIP_COINNAMES');

		const result = Math.random() > 0.5 ? CoinType.Heads : CoinType.Tails;
		const won = result === guess;
		const updatedBalance = won ? money + wager : money - wager;

		await message.author.settings.update(UserSettings.Money, updatedBalance);
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(message.language.tget(won ? 'COMMAND_COINFLIP_WIN_TITLE' : 'COMMAND_COINFLIP_LOSE_TITLE'))
			.setDescription(message.language.tget(won ? 'COMMAND_COINFLIP_WIN_DESCRIPTION' : 'COMMAND_COINFLIP_LOSE_DESCRIPTION', coinNames[result], wager))
			.setThumbnail(`https://cdn.skyra.pw/img/coins/${this.cdnTypes[result]}.png`));
	}


	private cashless(message: KlasaMessage, guess: CoinType) {
		const result = Math.random() > 0.5 ? CoinType.Heads : CoinType.Tails;
		const won = result === guess;
		return message.send(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(message.language.tget(won ? 'COMMAND_COINFLIP_WIN_TITLE' : 'COMMAND_COINFLIP_LOSE_TITLE'))
			.setDescription(message.language.tget(won ? 'COMMAND_COINFLIP_WIN_DESCRIPTION' : 'COMMAND_COINFLIP_LOSE_DESCRIPTION', message.language.tget('COMMAND_COINFLIP_COINNAMES')[result]))
			.setThumbnail(`https://cdn.skyra.pw/img/coins/${this.cdnTypes[result]}.png`));
	}

	private noGuess(message: KlasaMessage) {
		const result = Math.random() > 0.5 ? CoinType.Heads : CoinType.Tails;
		return message.send(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle('COMMAND_COINFLIP_NOGUESS_TITLE')
			.setDescription(message.language.tget('COMMAND_COINFLIP_NOGUESS_DESCRIPTION', message.language.tget('COMMAND_COINFLIP_COINNAMES')[result]))
			.setThumbnail(`https://cdn.skyra.pw/img/coins/${this.cdnTypes[result]}.png`));
	}

}
