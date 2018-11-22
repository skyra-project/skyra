import { Command, Permissions : { FLAGS }; } from; '../../index';

const EMOJIS = ['↖', '⬆', '↗', '⬅', '⏺', '➡', '↙', '⬇', '↘'];
const PLAYER = ['⭕', '❌'];
const RESPONSE_OPTIONS = { time: 30000, errors: ['time'], max: 1 };

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['ttt'],
			requiredPermissions: [FLAGS.ADD_REACTIONS],
			cooldown: 10,
			description: (language) => language.get('COMMAND_TICTACTOE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_TICTACTOE_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.channels = new Set();
	}

	public async run(msg, [user]) {
		if (user.id === this.client.user.id) throw msg.language.get('COMMAND_GAMES_SKYRA');
		if (user.bot) throw msg.language.get('COMMAND_GAMES_BOT');
		if (user.id === msg.author.id) throw msg.language.get('COMMAND_GAMES_SELF');
		if (this.channels.has(msg.channel.id)) throw msg.language.get('COMMAND_GAMES_PROGRESS');
		this.channels.add(msg.channel.id);

		const prompt = await msg.sendLocale('COMMAND_TICTACTOE_PROMPT', [msg.author, user]);
		const response = await msg.channel.awaitMessages((message) => message.author.id === user.id && /^(ye(s|ah?)?|no)$/i.test(message.content), RESPONSE_OPTIONS)
			.then((messages) => messages.first())
			.catch(() => false);

		if (!response || !/ye(s|ah?)?/i.test(response.content)) {
			await prompt.edit(msg.language.get(response ? 'COMMAND_GAMES_PROMPT_DENY' : 'COMMAND_GAMES_PROMPT_TIMEOUT'));
			this.channels.delete(msg.channel.id);
			return prompt.nuke(10000);
		}

		try {
			await this.game(prompt, [msg.author, user].sort(() => Math.random() - 0.5));
		} catch (_) {
			await prompt.edit(msg.language.get('UNEXPECTED_ISSUE')).catch((error) => this.client.emit('apiError', error));
		}

		this.channels.delete(msg.channel.id);
		return prompt;
	}

	public async game(msg, players) {
		// Add all reactions
		for (const emoji of EMOJIS) await msg.react(emoji);
		const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];

		try {
			const winner = await this._game(msg, players, board);
			return msg.edit(winner
				? msg.language.get('COMMAND_TICTACTOE_WINNER', players[winner - 1].username, this.render(board))
				: msg.language.get('COMMAND_TICTACTOE_DRAW', this.render(board)));
		} catch (message) {
			if (typeof message === 'string') return msg.edit(message);
			throw message;
		}
	}

	public _game(msg, players, board) {
		let timeout, turn = 0, chosen, winner, player, blocked = true;
		return new Promise((resolve, reject) => {
			// Make the collectors
			const collector = msg.createReactionCollector((reaction, user) => !blocked
				&& user.id === player.id
				&& (chosen = EMOJIS.indexOf(reaction.emoji.name)) !== -1
				&& board[chosen] === 0);

			const makeRound = async() => {
				if (timeout) clearTimeout(timeout);
				player = players[turn % 2];

				try {
					await msg.edit(msg.language.get('COMMAND_TICTACTOE_TURN', PLAYER[turn % 2], player.username, this.render(board)));
					timeout = setTimeout(() => {
						collector.stop();
						reject(msg.language.get('COMMAND_GAMES_TIMEOUT'));
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
					resolve();
				}
			});
		});
	}

	public checkBoard(board) {
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

	public render(board) {
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
