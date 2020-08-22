import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { CLIENT_ID } from '@root/config';
import { floatPromise } from '@utils/util';
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
			description: (language) => language.get('commandTicTacToeDescription'),
			extendedHelp: (language) => language.get('commandTicTacToeExtended'),
			requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.prompt = this.definePrompt('<response:boolean>');
	}

	public async run(message: KlasaMessage, [user]: [User]) {
		if (user.id === CLIENT_ID) throw message.language.get('commandGamesSkyra');
		if (user.bot) throw message.language.get('commandGamesBot');
		if (user.id === message.author.id) throw message.language.get('commandGamesSelf');
		if (this.channels.has(message.channel.id)) throw message.language.get('commandGamesProgress');
		this.channels.add(message.channel.id);

		try {
			const [response] = await this.prompt
				.createPrompt(message, { target: user })
				.run(message.language.get('commandTicTacToePrompt', { challenger: message.author.toString(), challengee: user.toString() }));
			if (response) {
				try {
					const gameMessage = await message.sendLocale('systemLoading', []);
					await this.game(
						gameMessage,
						[message.author, user].sort(() => Math.random() - 0.5)
					);
				} catch {
					await message.sendLocale('unexpectedIssue').catch((error) => this.client.emit(Events.ApiError, error));
				}
			} else {
				await message.alert(message.language.get('commandGamesPromptDeny'));
			}
		} catch {
			await message.alert(message.language.get('commandGamesPromptTimeout'));
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
					? message.language.get('commandTicTacToeWinner', { winner: players[winner - 1].username, board: this.render(board) })
					: message.language.get('commandTicTacToeDraw', { board: this.render(board) })
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
						message.language.get('commandTicTacToeTurn', {
							icon: PLAYER[turn % 2],
							player: player.username,
							board: this.render(board)
						})
					);
					timeout = setTimeout(() => {
						collector.stop();
						reject(message.language.get('commandGamesTimeout'));
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

	private checkBoard(board: number[]) {
		for (let i = 0; i < 3; i++) {
			const n = i * 3;
			if (board[i] === 0) continue;
			// Check rows, then columns
			if (board[i] === board[n + 1] && board[n + 1] === board[n + 2]) return board[i];
			if (board[i] === board[i + 3] && board[i + 3] === board[i + 6]) return board[i];
		}
		// check diagonals
		if (board[0] !== 0 && board[0] === board[4] && board[4] === board[8]) return board[0];
		if (board[2] !== 0 && board[2] === board[4] && board[4] === board[6]) return board[2];

		// no winner
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
