import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

const EMOJIS = ['↖', '⬆', '↗', '⬅', '⏺', '➡', '↙', '⬇', '↘'];
const PLAYER = ['⭕', '❌'];
const RESPONSE_OPTIONS = { time: 30000, errors: ['time'], max: 1 };

export default class extends SkyraCommand {

	private channels: Set<string> = new Set();

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['ttt'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_TICTACTOE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_TICTACTOE_EXTENDED'),
			requiredPermissions: ['ADD_REACTIONS'],
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		if (user.id === this.client.user.id) throw message.language.get('COMMAND_GAMES_SKYRA');
		if (user.bot) throw message.language.get('COMMAND_GAMES_BOT');
		if (user.id === message.author.id) throw message.language.get('COMMAND_GAMES_SELF');
		if (this.channels.has(message.channel.id)) throw message.language.get('COMMAND_GAMES_PROGRESS');
		this.channels.add(message.channel.id);

		const prompt = await message.sendLocale('COMMAND_TICTACTOE_PROMPT', [message.author, user]) as KlasaMessage;
		const response = await message.channel.awaitMessages((msg) => msg.author.id === user.id && /^(ye(s|ah?)?|no)$/i.test(msg.content), RESPONSE_OPTIONS)
			.then((messages) => messages.first())
			.catch(() => null);

		if (!response || !/ye(s|ah?)?/i.test(response.content)) {
			await prompt.edit(message.language.get(response ? 'COMMAND_GAMES_PROMPT_DENY' : 'COMMAND_GAMES_PROMPT_TIMEOUT'));
			this.channels.delete(message.channel.id);
			return prompt.nuke(10000);
		}

		try {
			await this.game(prompt, [message.author, user].sort(() => Math.random() - 0.5));
		} catch (_) {
			await prompt.edit(message.language.get('UNEXPECTED_ISSUE')).catch((error) => this.client.emit('apiError', error));
		}

		this.channels.delete(message.channel.id);
		return prompt;
	}

	public async game(message: KlasaMessage, players: KlasaUser[]) {
		// Add all reactions
		for (const emoji of EMOJIS) await message.react(emoji);
		const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];

		try {
			const winner = await this._game(message, players, board);
			return message.edit(winner
				? message.language.get('COMMAND_TICTACTOE_WINNER', players[winner - 1].username, this.render(board))
				: message.language.get('COMMAND_TICTACTOE_DRAW', this.render(board)));
		} catch (error) {
			if (typeof error === 'string') return message.edit(error);
			throw error;
		}
	}

	private _game(message: KlasaMessage, players: KlasaUser[], board: number[]) {
		let timeout: NodeJS.Timeout, turn = 0, chosen: number, winner: number, player: KlasaUser, blocked = true;
		return new Promise<number>((resolve, reject) => {
			// Make the collectors
			const collector = message.createReactionCollector((reaction, user) => !blocked
				&& user.id === player.id
				&& (chosen = EMOJIS.indexOf(reaction.emoji.name)) !== -1
				&& board[chosen] === 0);

			const makeRound = async() => {
				if (timeout) clearTimeout(timeout);
				player = players[turn % 2];

				try {
					await message.edit(message.language.get('COMMAND_TICTACTOE_TURN', PLAYER[turn % 2], player.username, this.render(board)));
					timeout = setTimeout(() => {
						collector.stop();
						reject(message.language.get('COMMAND_GAMES_TIMEOUT'));
					}, 60000);
					blocked = false;
				} catch (error) {
					collector.stop();
					reject(error);
				}
			};

			makeRound();

			collector.on('collect', () => {
				blocked = true;

				// Clear the timeout
				clearTimeout(timeout);

				// Set the piece
				board[chosen] = (turn % 2) + 1;

				// If there is a winner, resolve with it
				if (winner = this.checkBoard(board)) {
					collector.stop();
					resolve(winner);
				} else if (++turn < 9) {
					makeRound();
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
		return undefined;
	}

	private render(board: number[]) {
		let output = '', i = 0;
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
