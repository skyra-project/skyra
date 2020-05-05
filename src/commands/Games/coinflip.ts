import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { ApplyOptions } from '@skyra/decorators';
import { cleanMentions, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

const enum CoinType { Heads, Tails }

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['cf'],
	bucket: 2,
	cooldown: 7,
	description: language => language.tget('COMMAND_COINFLIP_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_COINFLIP_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '(coin:cointype) (wager:coinwager)',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	private readonly cdnTypes = ['heads', 'tails'] as const;

	public async run(message: KlasaMessage, [guess, wager]: [CoinType | null, number | 'cashless']) {
		if (guess === null) return this.noGuess(message);
		if (wager === 'cashless') return this.cashless(message, guess);

		await message.author.settings.sync();
		const money = message.author.settings.get(UserSettings.Money);

		if (money < wager) {
			throw message.language.tget('GAMES_NOT_ENOUGH_MONEY', money);
		}

		const result = this.flipCoin();
		const won = result === guess;
		await (won
			? message.author.increaseBalance(wager)
			: message.author.decreaseBalance(wager));

		return message.sendEmbed(this.buildEmbed(message, result)
			.setTitle(message.language.tget(won ? 'COMMAND_COINFLIP_WIN_TITLE' : 'COMMAND_COINFLIP_LOSE_TITLE'))
			.setDescription(message.language.tget(won ? 'COMMAND_COINFLIP_WIN_DESCRIPTION' : 'COMMAND_COINFLIP_LOSE_DESCRIPTION', message.language.tget('COMMAND_COINFLIP_COINNAMES')[result], wager)));
	}

	public async init() {
		this.createCustomResolver('cointype', (arg, _possible, message) => {
			if (!arg) return null;
			const lArg = arg.toLowerCase();
			const face = message.language.tget('COMMAND_COINFLIP_COINNAMES').findIndex(coin => coin.toLowerCase() === lArg);
			if (face === -1) throw message.language.tget('COMMAND_COINFLIP_INVALID_COINNAME', cleanMentions(message.guild!, arg));
			return face;
		});

		this.createCustomResolver('coinwager', (arg, possible, message) => {
			if (!arg) return 'cashless';
			return this.shinyWagerArg.run(arg, possible, message);
		});
	}

	private get shinyWagerArg() {
		return this.client.arguments.get('shinywager')!;
	}

	private cashless(message: KlasaMessage, guess: CoinType) {
		const result = this.flipCoin();
		const won = result === guess;
		return message.send(this.buildEmbed(message, result)
			.setTitle(message.language.tget(won ? 'COMMAND_COINFLIP_WIN_TITLE' : 'COMMAND_COINFLIP_LOSE_TITLE'))
			.setDescription(message.language.tget(won ? 'COMMAND_COINFLIP_WIN_DESCRIPTION' : 'COMMAND_COINFLIP_LOSE_DESCRIPTION', message.language.tget('COMMAND_COINFLIP_COINNAMES')[result])));
	}

	private noGuess(message: KlasaMessage) {
		const result = this.flipCoin();
		return message.send(this.buildEmbed(message, result)
			.setTitle(message.language.tget('COMMAND_COINFLIP_NOGUESS_TITLE'))
			.setDescription(message.language.tget('COMMAND_COINFLIP_NOGUESS_DESCRIPTION', message.language.tget('COMMAND_COINFLIP_COINNAMES')[result])));
	}

	private flipCoin() {
		return Math.random() > 0.5 ? CoinType.Heads : CoinType.Tails;
	}

	private buildEmbed(message: KlasaMessage, result: CoinType) {
		return new MessageEmbed()
			.setColor(getColor(message))
			.setThumbnail(`https://cdn.skyra.pw/img/coins/${this.cdnTypes[result]}.png`);
	}

}
