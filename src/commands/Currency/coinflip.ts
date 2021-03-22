import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, IArgument } from '@sapphire/framework';
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
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	private readonly cdnTypes = ['heads', 'tails'] as const;

	public async run(message: Message, args: SkyraCommand.Args) {
		const guess = args.finished ? null : await args.pick(UserCommand.coinTypeResolver);
		const wager = args.finished ? 'cashless' : await args.pick('shinyWager');

		if (guess === null) return this.noGuess(message, args.t);
		if (wager === 'cashless') return this.cashless(message, args.t, guess);

		const { users } = this.context.db;
		const settings = await users.ensure(message.author.id);
		const balance = settings.money;

		if (balance < wager) {
			this.error(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const result = this.flipCoin();
		const won = result === guess;
		settings.money += won ? wager : -wager;
		await settings.save();

		const [title, description] = won
			? ([LanguageKeys.Commands.Games.CoinFlipWinTitle, LanguageKeys.Commands.Games.CoinFlipWinDescriptionWithWager] as const)
			: ([LanguageKeys.Commands.Games.CoinFlipLoseTitle, LanguageKeys.Commands.Games.CoinFlipLoseDescriptionWithWager] as const);

		return message.send(
			(await this.buildEmbed(message, result))
				.setTitle(args.t(title))
				.setDescription(args.t(description, { result: args.t(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result], wager }))
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
					t(LanguageKeys.Commands.Games.CoinFlipNoGuessDescription, { result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result] })
				)
		);
	}

	private flipCoin() {
		return Math.random() > 0.5 ? CoinType.Heads : CoinType.Tails;
	}

	private async buildEmbed(message: Message, result: CoinType) {
		return new MessageEmbed()
			.setColor(await this.context.db.fetchColor(message))
			.setThumbnail(`https://cdn.skyra.pw/skyra-assets/coins_${this.cdnTypes[result]}.png`);
	}

	private static coinTypeResolver: IArgument<CoinType | null> = Args.make((parameter, { argument, args }) => {
		const lowerCaseParameter = parameter.toLowerCase();
		if (args.t(LanguageKeys.Commands.Games.CoinFlipHeadNames).includes(lowerCaseParameter)) return Args.ok(CoinType.Heads);
		if (args.t(LanguageKeys.Commands.Games.CoinFlipTailNames).includes(lowerCaseParameter)) return Args.ok(CoinType.Tails);
		return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Games.CoinFlipInvalidCoinName });
	});
}
