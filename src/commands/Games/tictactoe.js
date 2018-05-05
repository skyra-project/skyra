const { Command, Permissions: { FLAGS } } = require('../../index');

const EMOJIS = ['↖', '⬆', '↗', '⬅', '⏺', '➡', '↙', '⬇', '↘'];
const PLAYER = ['⭕', '❌'];
const RESPONSE_OPTIONS = { time: 30000, errors: ['time'], max: 1 };
const REACTION_OPTIONS = { time: 60000, errors: ['time'], max: 1 };

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ttt'],
			botPerms: [FLAGS.ADD_REACTIONS],
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_TICTACTOE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_TICTACTOE_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.channels = new Set();
	}

	async run(msg, [user]) {
		if (user.id === this.client.user.id) throw msg.language.get('COMMAND_GAMES_SKYRA');
		if (user.bot) throw msg.language.get('COMMAND_GAMES_BOT');
		if (user.id === msg.author.id) throw msg.language.get('COMMAND_GAMES_SELF');
		if (this.channels.has(msg.channel.id)) throw msg.language.get('COMMAND_GAMES_PROGRESS');
		this.channels.add(msg.channel.id);

		const prompt = await msg.sendMessage(msg.language.get('COMMAND_TICTACTOE_PROMPT', msg.author, user));
		const response = await msg.channel.awaitMessages(message => message.author.id === user.id && /^(ye(s|ah?)?|no)$/i.test(message.content), RESPONSE_OPTIONS)
			.then(messages => messages.first())
			.catch(() => false);

		if (!response || !/ye(s|ah?)?/i.test(response.content)) {
			await prompt.edit(msg.language.get(response ? 'COMMAND_GAMES_PROMPT_DENY' : 'COMMAND_GAMES_PROMPT_TIMEOUT'));
			this.channels.delete(msg.channel.id);
			return prompt.nuke(10000);
		}

		await this.game(prompt, [msg.author, user].sort(() => Math.random() - 0.5));
		this.channels.delete(msg.channel.id);
		return prompt;
	}

	async game(msg, players) {
		// Add all reactions
		for (const emoji of EMOJIS) await msg.react(emoji);

		const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		let turn = Math.round(Math.random()), winner;

		do {
			const user = players[turn % 2];
			await msg.edit(msg.language.get('COMMAND_TICTACTOE_TURN', PLAYER[turn % 2], user.username, this.render(board)));
			try {
				let chosen;
				await msg.awaitReactions((reaction, rUser) => user === rUser
					&& (chosen = EMOJIS.indexOf(reaction.emoji.name)) !== -1
					&& board[chosen] === 0, REACTION_OPTIONS);

				board[chosen] = (turn % 2) + 1;
				if (winner = this.checkBoard(board)) break;
			} catch (_) {
				return msg.edit(msg.language.get('COMMAND_GAMES_TIMEOUT'));
			}
		} while (++turn < 9);

		return msg.edit(turn !== 9
			? msg.language.get('COMMAND_TICTACTOE_WINNER', players[winner - 1].username, this.render(board))
			: msg.language.get('COMMAND_TICTACTOE_DRAW', this.render(board)));
	}

	checkBoard(board) {
		for (let i = 0; i < 3; i++) {
			const n = i * 3;
			if (board[n] === 0) continue;
			// Check rows, then columns
			if (board[n] === board[n + 1] && board[n + 1] === board[n + 2]) return board[n];
			if (board[n] === board[n + 4] && board[n + 4] === board[n + 6]) return board[n];
		}
		// check diagonals
		if (board[0] !== 0 && board[0] === board[5] && board[5] === board[8]) return board[0];
		if (board[2] !== 0 && board[2] === board[5] && board[5] === board[6]) return board[2];

		// no winner
		return undefined;
	}

	render(board) {
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

};
