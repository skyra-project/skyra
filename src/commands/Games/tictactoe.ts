import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { floatPromise, pickRandom } from '@utils/util';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage, Usage } from 'klasa';

const EMOJIS = ['↖', '⬆', '↗', '⬅', '⏺', '➡', '↙', '⬇', '↘'];
const PLAYER = ['⭕', '❌'];

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
		if (user.id === CLIENT_ID) throw message.language.get(LanguageKeys.Commands.Games.GamesSkyra);
		if (user.bot) throw message.language.get(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) throw message.language.get(LanguageKeys.Commands.Games.GamesSelf);
		if (this.channels.has(message.channel.id)) throw message.language.get(LanguageKeys.Commands.Games.GamesProgress);
		this.channels.add(message.channel.id);

		try {
			const [response] = await this.prompt.createPrompt(message, { target: user }).run(
				message.language.get(LanguageKeys.Commands.Games.TicTacToePrompt, {
					challenger: message.author.toString(),
					challengee: user.toString()
				})
			);
			if (response) {
				try {
					const gameMessage = await message.send(pickRandom(message.language.get(LanguageKeys.System.Loading)), []);
					await this.game(
						gameMessage,
						[message.author, user].sort(() => Math.random() - 0.5)
					);
				} catch {
					await message.sendLocale(LanguageKeys.Misc.UnexpectedIssue).catch((error) => this.client.emit(Events.ApiError, error));
				}
			} else {
				await message.alert(message.language.get(LanguageKeys.Commands.Games.GamesPromptDeny));
			}
		} catch {
			await message.alert(message.language.get(LanguageKeys.Commands.Games.GamesPromptTimeout));
		} finally {
			this.channels.delete(message.channel.id);
		}
	}

	public async game(message: KlasaMessage, players: User[]) {
		// Add all reactions
		for (const emoji of EMOJIS) await message.react(emoji);
		const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];

		try {
			const winner = await this._game(message, players, board);
			return await message.edit(
				winner
					? message.language.get(LanguageKeys.Commands.Games.TicTacToeWinner, {
							winner: players[winner - 1].username,
							board: this.render(board)
					  })
					: message.language.get(LanguageKeys.Commands.Games.TicTacToeDraw, { board: this.render(board) })
			);
		} catch (error) {
			if (typeof error === 'string') return message.edit(error);
			throw error;
		}
	}

	private _game(message: KlasaMessage, players: User[], board: number[]) {
		let timeout: NodeJS.Timeout | undefined = undefined;
		let turn = 0;
		let chosen: number | undefined = undefined;
		let winner: number | null | undefined = undefined;
		let player: User | undefined = undefined;
		let blocked = true;

		return new Promise<number | null>((resolve, reject) => {
			// Make the collectors
			const collector = message.createReactionCollector(
				(reaction, user) => !blocked && user.id === player?.id && (chosen = EMOJIS.indexOf(reaction.emoji.name)) !== -1 && board[chosen] === 0
			);

			const makeRound = async () => {
				if (timeout) clearTimeout(timeout);
				player = players[turn % 2];

				try {
					await message.edit(
						message.language.get(LanguageKeys.Commands.Games.TicTacToeTurn, {
							icon: PLAYER[turn % 2],
							player: player.username,
							board: this.render(board)
						})
					);
					timeout = setTimeout(() => {
						collector.stop();
						reject(message.language.get(LanguageKeys.Commands.Games.GamesTimeout));
					}, 60000);
					blocked = false;
				} catch (error) {
					collector.stop();
					reject(error);
				}
			};

			floatPromise(this, makeRound());

			collector.on('collect', () => {
				blocked = true;

				// Clear the timeout
				clearTimeout(timeout as NodeJS.Timeout);

				// Set the piece
				board[chosen as number] = (turn % 2) + 1;

				// If there is a winner, resolve with it
				winner = this.checkBoard(board);
				if (winner) {
					collector.stop();
					resolve(winner);
				} else if (++turn < 9) {
					floatPromise(this, makeRound());
				} else {
					collector.stop();
					resolve(null);
				}
			});
		});
	}

	private equals(a: number, b: number, c: number): boolean {
		return a === b && b === c;
	}

	private checkBoard(board: readonly number[]) {
		// 0 1 2
		// 3 4 5
		// 6 7 8

		let a: number | undefined = undefined;

		// Check rows
		for (let i = 0; i < 9; i += 3) {
			a = board[i];
			if (a === 0) continue;

			if (this.equals(a, board[i + 1], board[i + 2])) return a;
		}

		// Check columns
		for (let i = 0; i < 3; ++i) {
			a = board[i];
			if (a === 0) continue;

			if (this.equals(a, board[i + 3], board[i + 6])) return a;
		}

		// Check descending diagonal
		// eslint-disable-next-line prefer-destructuring
		a = board[0];
		if (a !== 0 && this.equals(a, board[4], board[8])) return a;

		// Check ascending diagonal
		// eslint-disable-next-line prefer-destructuring
		a = board[6];
		if (a !== 0 && this.equals(a, board[4], board[2])) return a;

		return null;
	}

	private render(board: number[]) {
		let output = '';
		let i = 0;
		while (i < board.length) {
			for (const value of board.slice(i, i + 3)) {
				output += value === 0 ? EMOJIS[i] : PLAYER[value - 1];
				i++;
			}

			output += '\n';
		}

		return output;
	}
}
