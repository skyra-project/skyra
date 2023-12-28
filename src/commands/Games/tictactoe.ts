import { TicTacToeBotController } from '#lib/games/tic-tac-toe/TicTacToeBotController';
import { TicTacToeGame } from '#lib/games/tic-tac-toe/TicTacToeGame';
import { TicTacToeHumanController } from '#lib/games/tic-tac-toe/TicTacToeHumanController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { promptConfirmation } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits, type User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['ttt'],
	description: LanguageKeys.Commands.Games.TicTacToeDescription,
	detailedDescription: LanguageKeys.Commands.Games.TicTacToeExtended,
	requiredClientPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	private readonly channels: Set<string> = new Set();

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		if (this.channels.has(message.channel.id)) this.error(LanguageKeys.Commands.Games.GamesProgress);

		const user = await args.pick('userName');
		const player1 = this.getAuthorController(message);
		const player2 = await this.getTargetController(message, args.t, user);

		this.channels.add(message.channel.id);
		const game = new TicTacToeGame(message, player1, player2);

		try {
			await game.run();
		} finally {
			this.channels.delete(message.channel.id);
		}
	}

	private getAuthorController(message: GuildMessage) {
		return new TicTacToeHumanController(message.author.username, message.author.id);
	}

	private async getTargetController(message: GuildMessage, t: TFunction, user: User) {
		if (user.id === process.env.CLIENT_ID) return new TicTacToeBotController();
		if (user.bot) this.error(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) this.error(LanguageKeys.Commands.Games.GamesSelf);

		const response = await promptConfirmation(message, {
			content: t(LanguageKeys.Commands.Games.TicTacToePrompt, {
				challenger: message.author.toString(),
				challengee: user.toString()
			}),
			target: user
		});

		if (response) return new TicTacToeHumanController(user.username, user.id);
		this.error(LanguageKeys.Commands.Games.GamesPromptDeny);
	}
}
