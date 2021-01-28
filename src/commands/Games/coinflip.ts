import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolvers } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const enum CoinType {
	Heads,
	Tails
}

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['cf'],
	bucket: 2,
	cooldown: 7,
	description: LanguageKeys.Commands.Games.CoinFlipDescription,
	extendedHelp: LanguageKeys.Commands.Games.CoinFlipExtended,
	permissions: ['EMBED_LINKS'],
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
			const face = t(LanguageKeys.Commands.Games.CoinFlipCoinNames).findIndex((coin) => coin.toLowerCase() === lArg);
			if (face === -1) throw t(LanguageKeys.Commands.Games.CoinFlipInvalidCoinName, { arg });
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
export class UserCommand extends SkyraCommand {
	private readonly cdnTypes = ['heads', 'tails'] as const;

	public async run(message: Message, [guess, wager]: [CoinType | null, number | 'cashless']) {
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
							result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result],
							wager
						}
					)
				)
		);
	}

	private async cashless(message: Message, t: TFunction, guess: CoinType) {
		const result = this.flipCoin();
		const won = result === guess;

		return message.send(
			(await this.buildEmbed(message, result))
				.setTitle(t(won ? LanguageKeys.Commands.Games.CoinFlipWinTitle : LanguageKeys.Commands.Games.CoinFlipLoseTitle))
				.setDescription(
					t(won ? LanguageKeys.Commands.Games.CoinFlipWinDescription : LanguageKeys.Commands.Games.CoinFlipLoseDescription, {
						result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result]
					})
				)
		);
	}

	private async noGuess(message: Message, t: TFunction) {
		const result = this.flipCoin();

		return message.send(
			(await this.buildEmbed(message, result)) //
				.setTitle(t(LanguageKeys.Commands.Games.CoinFlipNoGuessTitle))
				.setDescription(
					t(LanguageKeys.Commands.Games.CoinFlipNoGuessDescription, {
						result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result]
					})
				)
		);
	}

	private flipCoin() {
		return Math.random() > 0.5 ? CoinType.Heads : CoinType.Tails;
	}

	private async buildEmbed(message: Message, result: CoinType) {
		return new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setThumbnail(`https://cdn.skyra.pw/skyra-assets/coins_${this.cdnTypes[result]}.png`);
	}
}
