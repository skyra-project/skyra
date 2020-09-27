import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

const enum CoinType {
	Heads,
	Tails
}

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['cf'],
	bucket: 2,
	cooldown: 7,
	description: (language) => language.get(LanguageKeys.Commands.Games.CoinFlipDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Games.CoinFlipExtended),
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

		const { users } = await DbSet.connect();
		const settings = await users.ensure(message.author.id);
		const balance = settings.money;

		if (balance < wager) {
			throw message.language.get(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const result = this.flipCoin();
		const won = result === guess;
		settings.money += won ? wager : -wager;
		await settings.save();

		return message.sendEmbed(
			(await this.buildEmbed(message, result))
				.setTitle(message.language.get(won ? LanguageKeys.Commands.Games.CoinFlipWinTitle : LanguageKeys.Commands.Games.CoinFlipLoseTitle))
				.setDescription(
					message.language.get(
						won
							? LanguageKeys.Commands.Games.CoinFlipWinDescriptionWithWager
							: LanguageKeys.Commands.Games.CoinFlipLoseDescriptionWithWager,
						{
							result: message.language.get(LanguageKeys.Commands.Games.CoinFlipCoinnames)[result],
							wager
						}
					)
				)
		);
	}

	public async init() {
		this.createCustomResolver('cointype', (arg, _possible, message) => {
			if (!arg) return null;
			const lArg = arg.toLowerCase();
			const face = message.language.get(LanguageKeys.Commands.Games.CoinFlipCoinnames).findIndex((coin) => coin.toLowerCase() === lArg);
			if (face === -1) throw message.language.get(LanguageKeys.Commands.Games.CoinFlipInvalidCoinname, { arg });
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

	private async cashless(message: KlasaMessage, guess: CoinType) {
		const result = this.flipCoin();
		const won = result === guess;
		return message.send(
			(await this.buildEmbed(message, result))
				.setTitle(message.language.get(won ? LanguageKeys.Commands.Games.CoinFlipWinTitle : LanguageKeys.Commands.Games.CoinFlipLoseTitle))
				.setDescription(
					message.language.get(
						won ? LanguageKeys.Commands.Games.CoinFlipWinDescription : LanguageKeys.Commands.Games.CoinFlipLoseDescription,
						{
							result: message.language.get(LanguageKeys.Commands.Games.CoinFlipCoinnames)[result]
						}
					)
				)
		);
	}

	private async noGuess(message: KlasaMessage) {
		const result = this.flipCoin();
		return message.send(
			(await this.buildEmbed(message, result)).setTitle(message.language.get(LanguageKeys.Commands.Games.CoinFlipNoguessTitle)).setDescription(
				message.language.get(LanguageKeys.Commands.Games.CoinFlipNoguessDescription, {
					result: message.language.get(LanguageKeys.Commands.Games.CoinFlipCoinnames)[result]
				})
			)
		);
	}

	private flipCoin() {
		return Math.random() > 0.5 ? CoinType.Heads : CoinType.Tails;
	}

	private async buildEmbed(message: KlasaMessage, result: CoinType) {
		return new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setThumbnail(`https://cdn.skyra.pw/skyra-assets/coins_${this.cdnTypes[result]}.png`);
	}
}
