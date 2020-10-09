import { TicTacToeBotController } from '@lib/games/tic-tac-toe/TicTacToeBotController';
import { TicTacToeGame } from '@lib/games/tic-tac-toe/TicTacToeGame';
import { TicTacToeHumanController } from '@lib/games/tic-tac-toe/TicTacToeHumanController';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage, Usage } from 'klasa';

export default class extends SkyraCommand {
	private readonly channels: Set<string> = new Set();
	private prompt: Usage;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ttt'],
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Games.TicTacToeDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Games.TicTacToeExtended),
			requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.prompt = this.definePrompt('<response:boolean>');
	}

	public async run(message: KlasaMessage, [user]: [User]) {
		if (this.channels.has(message.channel.id)) throw message.language.get(LanguageKeys.Commands.Games.GamesProgress);
		const player1 = this.getAuthorController(message);
		const player2 = await this.getTargetController(message, user);

		this.channels.add(message.channel.id);
		const game = new TicTacToeGame(message, player1, player2);

		try {
			await game.run();
		} finally {
			this.channels.delete(message.channel.id);
		}
	}

	private getAuthorController(message: KlasaMessage) {
		return new TicTacToeHumanController(message.author.username, message.author.id);
	}

	private async getTargetController(message: KlasaMessage, user: User) {
		if (user.id === CLIENT_ID) return new TicTacToeBotController();
		if (user.bot) throw message.language.get(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) throw message.language.get(LanguageKeys.Commands.Games.GamesSelf);

		const [response] = await this.prompt.createPrompt(message, { target: user }).run(
			message.language.get(LanguageKeys.Commands.Games.TicTacToePrompt, {
				challenger: message.author.toString(),
				challengee: user.toString()
			})
		);

		if (response) return new TicTacToeHumanController(user.username, user.id);
		throw message.language.get(LanguageKeys.Commands.Games.GamesPromptDeny);
	}
}
