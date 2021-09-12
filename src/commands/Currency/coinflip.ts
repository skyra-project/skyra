import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, IArgument } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const enum CoinType {
	Heads,
	Tails
}

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['cf'],
	description: LanguageKeys.Commands.Games.CoinFlipDescription,
	extendedHelp: LanguageKeys.Commands.Games.CoinFlipExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const guess = args.finished ? null : await args.pick(UserCommand.coinTypeResolver);
		const wager = args.finished ? 'cashless' : await args.pick('shinyWager');

		if (guess === null) return this.noGuess(message, args.t);
		if (wager === 'cashless') return this.cashless(message, args.t, guess);

		const { users } = this.container.db;
		const settings = await users.ensure(message.author.id);
		const balance = settings.money;

		if (balance < wager) {
			this.error(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const result = this.flipCoin();
		const won = result === guess;
		settings.money += won ? wager : -wager;
		await settings.save();

		const [titleKey, descriptionKey] = won
			? ([LanguageKeys.Commands.Games.CoinFlipWinTitle, LanguageKeys.Commands.Games.CoinFlipWinDescriptionWithWager] as const)
			: ([LanguageKeys.Commands.Games.CoinFlipLoseTitle, LanguageKeys.Commands.Games.CoinFlipLoseDescriptionWithWager] as const);
		const title = args.t(titleKey);
		const description = args.t(descriptionKey, { result: args.t(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result], wager });

		const embed = await this.buildEmbed(message, result, title, description);
		return send(message, { embeds: [embed] });
	}

	private async cashless(message: Message, t: TFunction, guess: CoinType) {
		const result = this.flipCoin();
		const won = result === guess;

		const title = t(won ? LanguageKeys.Commands.Games.CoinFlipWinTitle : LanguageKeys.Commands.Games.CoinFlipLoseTitle);
		const description = t(won ? LanguageKeys.Commands.Games.CoinFlipWinDescription : LanguageKeys.Commands.Games.CoinFlipLoseDescription, {
			result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result]
		});

		const embed = await this.buildEmbed(message, result, title, description);
		return send(message, { embeds: [embed] });
	}

	private async noGuess(message: Message, t: TFunction) {
		const result = this.flipCoin();

		const title = t(LanguageKeys.Commands.Games.CoinFlipNoGuessTitle);
		const description = t(LanguageKeys.Commands.Games.CoinFlipNoGuessDescription, {
			result: t(LanguageKeys.Commands.Games.CoinFlipCoinNames)[result]
		});

		const embed = await this.buildEmbed(message, result, title, description);
		return send(message, { embeds: [embed] });
	}

	private flipCoin() {
		return Math.random() > 0.5 ? CoinType.Heads : CoinType.Tails;
	}

	private async buildEmbed(message: Message, result: CoinType, title: string, description: string) {
		return new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setThumbnail(result === CoinType.Heads ? CdnUrls.CoinHeads : CdnUrls.CoinTails)
			.setTitle(title)
			.setDescription(description);
	}

	private static coinTypeResolver: IArgument<CoinType | null> = Args.make((parameter, { argument, args }) => {
		const lowerCaseParameter = parameter.toLowerCase();
		if (args.t(LanguageKeys.Commands.Games.CoinFlipHeadNames).includes(lowerCaseParameter)) return Args.ok(CoinType.Heads);
		if (args.t(LanguageKeys.Commands.Games.CoinFlipTailNames).includes(lowerCaseParameter)) return Args.ok(CoinType.Tails);
		return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Games.CoinFlipInvalidCoinName });
	});
}
