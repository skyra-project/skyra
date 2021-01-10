import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { KlasaMessage } from 'klasa';

const enum CoinType {
	Heads,
	Tails
}

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['cf'],
	bucket: 2,
	cooldown: 7,
	description: LanguageKeys.Commands.Games.CoinFlipDescription,
	extendedHelp: LanguageKeys.Commands.Games.CoinFlipExtended,
	requiredPermissions: ['EMBED_LINKS'],
	usage: '(coin:cointype) (wager:coinwager)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'cointype',
		async (arg, _possible, message) => {
			if (!arg) return null;
			const t = await message.fetchT();
			const lArg = arg.toLowerCase();
			const face = t(LanguageKeys.Commands.Games.CoinFlipCoinNames, { returnObjects: true }).findIndex((coin) => coin.toLowerCase() === lArg);
			if (face === -1) throw t(LanguageKeys.Commands.Games.CoinFlipInvalidCoinname, { arg });
			return face;
		}
	],
	[
		'coinwager',
		(arg, possible, message) => {
			if (!arg) return 'cashless';
			return message.client.arguments.get('shinywager')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	private readonly cdnTypes = ['heads', 'tails'] as const;

	public async run(message: KlasaMessage, [guess, wager]: [CoinType | null, number | 'cashless']) {
		const t = await message.fetchT();

		if (guess === null) return this.noGuess(message, t);
		if (wager === 'cashless') return this.cashless(message, t, guess);

		const { users } = await DbSet.connect();
		const settings = await users.ensure(message.author.id);
		const balance = settings.money;

		if (balance < wager) {
			throw t(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const result = this.flipCoin();
		const won = result === guess;
		settings.money += won ? wager : -wager;
		await settings.save();

		return message.send(
			(await this.buildEmbed(message, result))
				.setTitle(t(won ? LanguageKeys.Commands.Games.CoinFlipWinTitle : LanguageKeys.Commands.Games.CoinFlipLoseTitle))
				.setDescription(
					t(
						won
							? LanguageKeys.Commands.Games.CoinFlipWinDescriptionWithWager
							: LanguageKeys.Commands.Games.CoinFlipLoseDescriptionWithWager,
						{
							result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames, { returnObjects: true })[result],
							wager
						}
					)
				)
		);
	}

	private async cashless(message: KlasaMessage, t: TFunction, guess: CoinType) {
		const result = this.flipCoin();
		const won = result === guess;

		return message.send(
			(await this.buildEmbed(message, result))
				.setTitle(t(won ? LanguageKeys.Commands.Games.CoinFlipWinTitle : LanguageKeys.Commands.Games.CoinFlipLoseTitle))
				.setDescription(
					t(won ? LanguageKeys.Commands.Games.CoinFlipWinDescription : LanguageKeys.Commands.Games.CoinFlipLoseDescription, {
						result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames, { returnObjects: true })[result]
					})
				)
		);
	}

	private async noGuess(message: KlasaMessage, t: TFunction) {
		const result = this.flipCoin();

		return message.send(
			(await this.buildEmbed(message, result)) //
				.setTitle(t(LanguageKeys.Commands.Games.CoinFlipNoGuessTitle))
				.setDescription(
					t(LanguageKeys.Commands.Games.CoinFlipNoGuessDescription, {
						result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames, { returnObjects: true })[result]
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
