import { DbSet } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

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
	usage: '(coin:cointype) (wager:coinwager)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'cointype',
		async (arg, _possible, message) => {
			if (!arg) return null;
			const language = await message.fetchLanguage();
			const lArg = arg.toLowerCase();
			const face = language.get(LanguageKeys.Commands.Games.CoinFlipCoinNames).findIndex((coin) => coin.toLowerCase() === lArg);
			if (face === -1) throw language.get(LanguageKeys.Commands.Games.CoinFlipInvalidCoinname, { arg });
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
		const language = await message.fetchLanguage();

		if (guess === null) return this.noGuess(message, language);
		if (wager === 'cashless') return this.cashless(message, language, guess);

		const { users } = await DbSet.connect();
		const settings = await users.ensure(message.author.id);
		const balance = settings.money;

		if (balance < wager) {
			throw language.get(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const result = this.flipCoin();
		const won = result === guess;
		settings.money += won ? wager : -wager;
		await settings.save();

		return message.sendEmbed(
			(await this.buildEmbed(message, result))
				.setTitle(language.get(won ? LanguageKeys.Commands.Games.CoinFlipWinTitle : LanguageKeys.Commands.Games.CoinFlipLoseTitle))
				.setDescription(
					language.get(
						won
							? LanguageKeys.Commands.Games.CoinFlipWinDescriptionWithWager
							: LanguageKeys.Commands.Games.CoinFlipLoseDescriptionWithWager,
						{
							result: language.get(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result],
							wager
						}
					)
				)
		);
	}

	private async cashless(message: KlasaMessage, language: Language, guess: CoinType) {
		const result = this.flipCoin();
		const won = result === guess;

		return message.send(
			(await this.buildEmbed(message, result))
				.setTitle(language.get(won ? LanguageKeys.Commands.Games.CoinFlipWinTitle : LanguageKeys.Commands.Games.CoinFlipLoseTitle))
				.setDescription(
					language.get(won ? LanguageKeys.Commands.Games.CoinFlipWinDescription : LanguageKeys.Commands.Games.CoinFlipLoseDescription, {
						result: language.get(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result]
					})
				)
		);
	}

	private async noGuess(message: KlasaMessage, language: Language) {
		const result = this.flipCoin();

		return message.send(
			(await this.buildEmbed(message, result)) //
				.setTitle(language.get(LanguageKeys.Commands.Games.CoinFlipNoGuessTitle))
				.setDescription(
					language.get(LanguageKeys.Commands.Games.CoinFlipNoGuessDescription, {
						result: language.get(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result]
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
