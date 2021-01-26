import { TicTacToeBotController } from '#lib/games/tic-tac-toe/TicTacToeBotController';
import { TicTacToeGame } from '#lib/games/tic-tac-toe/TicTacToeGame';
import { TicTacToeHumanController } from '#lib/games/tic-tac-toe/TicTacToeHumanController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CLIENT_ID } from '#root/config';
import { PieceContext } from '@sapphire/framework';
import type { User } from 'discord.js';
import type { TFunction } from 'i18next';

export class UserCommand extends SkyraCommand {
	private readonly channels: Set<string> = new Set();

	public constructor(context: PieceContext) {
		super(context, {
			aliases: ['ttt'],
			cooldown: 10,
			description: LanguageKeys.Commands.Games.TicTacToeDescription,
			extendedHelp: LanguageKeys.Commands.Games.TicTacToeExtended,
			permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text']
		});
	}

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const { t } = args;
		if (this.channels.has(message.channel.id)) throw t(LanguageKeys.Commands.Games.GamesProgress);

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
		if (user.id === CLIENT_ID) return new TicTacToeBotController();
		if (user.bot) throw t(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) throw t(LanguageKeys.Commands.Games.GamesSelf);

		const response = await message.ask(
			t(LanguageKeys.Commands.Games.TicTacToePrompt, {
				challenger: message.author.toString(),
				challengee: user.toString()
			}),
			undefined,
			{ target: user }
		);

		if (response) return new TicTacToeHumanController(user.username, user.id);
		throw t(LanguageKeys.Commands.Games.GamesPromptDeny);
	}
}
