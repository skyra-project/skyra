import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { LongLivingReactionCollector, LLRCData } from '../../lib/util/LongLivingReactionCollector';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { Emojis } from '../../lib/util/constants';
import { getColor } from '../../lib/util/util';

enum ReactionEmoji {
	HIGHER = '⬆',
	LOWER = '⬇',
	CANCEL = '❌', // TODO: Replace with <:redCross:637706251257511973>
	OK = '✔️', // TODO: Replace with <:greenTick:637706251253317669>
	CASHOUT = '💰'
}

const enum EndingAction {
	PLAY,
	STOP,
	TIMEOUT
}

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['hilo', 'higherlower', 'hl'],
			bucket: 2,
			cooldown: 7,
			description: `Play the Higher Lower game against me`,
			extendedHelp: `as well as this`,
			requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		const wager = Number(text);
		const balance = message.author.settings.get(UserSettings.Money);
		if (wager > balance) throw message.language.get('COMMAND_SLOTMACHINES_MONEY', balance);

		let EmojiPromiseContext:  = undefined;

		const game: HigherLowerGameData = Object.seal({
			llrc: new LongLivingReactionCollector(this.client, async reaction => {
				// Ignore if resolve is not ready
				if (typeof resolveEmojiPromise !== 'function'
					// Run the collector inhibitor
					|| await this.reactionInhibitor(message, game.gameMessage!, reaction)) return;
				resolveEmojiPromise(reaction.emoji.name as ReactionEmoji);
			}),
			gameMessage: await message.send(`${Emojis.Loading} Starting a new game of High an' Low`),
			running: true,
			turn: 1,
			number: this.random(),
			wager
		});

		while (game.running) {
			await game.gameMessage.reactions.removeAll();
			// Send the embed
			await game.gameMessage.edit({
				content: null,
				embed: new MessageEmbed()
					.setColor(getColor(message))
					.setTitle(`Higher or Lower? | Turn ${game.turn}`)
					.setDescription(`Your number is ${game.number}. Will the next number be higher or lower?`)
					.setFooter('The game will expire in 3 minutes, so act fast!')
			});

			// Add the options
			const filterFunction = (e: ReactionEmoji, t: number) => e !== ReactionEmoji.OK && ((t === 1 && e !== ReactionEmoji.CASHOUT) || (t !== 1 && e !== ReactionEmoji.CANCEL));
			const reactArray = Object.values(ReactionEmoji).filter(e => filterFunction(e, game.turn));
			for (const emoji of reactArray) {
				await game.gameMessage.react(emoji);
			}

			// Grab the user selection
			const emojiSelected = await new Promise<ReactionEmoji>(res => {
				// Insert weird promise tomfoolery. I still havent completely understood how this works. Something something weird promise resolves
				resolveEmojiPromise = res;

				// Timeout logic
				const timeOut;
			});

			// Main game logic (at last)
			const oldNum = game.number;
			game.number = this.random(game.number);

			switch (emojiSelected) {
				case ReactionEmoji.HIGHER:
					game.running = await (oldNum < game.number ? this.win(game, message) : this.loss(game, message));
					break;

				case ReactionEmoji.LOWER:
					game.running = await (oldNum > game.number ? this.win(game, message) : this.loss(game, message));
					break;

				case ReactionEmoji.CASHOUT:
				case ReactionEmoji.CANCEL:
					await this.end(game, message, emojiSelected === ReactionEmoji.CASHOUT);
					game.running = false;
					break;
			}

			if (game.running) game.turn++;
		}
	}

	private async win(game: HigherLowerGameData, message: KlasaMessage) {
		console.log('in win arg');
		const { author: user } = message;
		await game.gameMessage.reactions.removeAll();
		// TODO(Quantum): Winning event
		await game.gameMessage.edit({
			content: '',
			embed: new MessageEmbed()
				.setColor(getColor(message as KlasaMessage))
				.setTitle(`Your won!`)
				.setDescription(`You did it! The number was ${game.number}. Want to continue? ${this.calculateWinnings(game.wager, game.turn)}${Emojis.Shiny} are on the line`)
				.setFooter('Act fast! You don\'t have much time')
		});
		console.log('filtering emotes');
		const reactArray = Object.values(ReactionEmoji).filter(e => e !== ReactionEmoji.HIGHER && e !== ReactionEmoji.LOWER && e !== ReactionEmoji.CASHOUT);
		for (const emoji of reactArray) {
			await game.gameMessage.react(emoji);
		}
		console.log('GETTING EMOTES');
		const reactionMap = await game.gameMessage.awaitReactions((r, u) => reactArray.includes(r.emoji.name) && u.id === user.id, { max: 1, time: 10000 });
		await game.gameMessage.reactions.removeAll();

		const whatToDo = reactionMap.size === 0
			? endingAction.TIMEOUT
			: reactionMap.first()!.emoji.name === ReactionEmoji.OK
				? endingAction.PLAY
				: endingAction.STOP;
		switch (whatToDo) {
			case endingAction.TIMEOUT:
				await game.gameMessage.edit('Prompt timed out. Cashing out winnings...', { embed: null });
			case endingAction.STOP:
				await this.end(game, message, true);
				break;
			case endingAction.PLAY:
				await game.gameMessage.edit('Alright. Starting new round', { embed: null });
				break;
		}
		return whatToDo === endingAction.PLAY;
	}

	private async loss(game: HigherLowerGameData, message: KlasaMessage) {
		// TODO(Quantum): Losing event
		const { number, wager, turn, gameMessage } = game;
		await gameMessage.reactions.removeAll();
		let losings = wager;
		if ((Math.random()) < 0.001) {
			losings += this.calculateWinnings(wager, turn - 1);
			await message.author.settings.decrease(UserSettings.Money, losings);
		}
		await gameMessage.edit(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(`You lost :\(`)
			.setDescription(`You didn't quite get it. The number was ${number}. You lost ${losings}${Emojis.Shiny}`)
			.setFooter('Better luck next time!'));
		console.log('mesage should be edited');
		return false;
	}

	private async end(game: HigherLowerGameData, message: KlasaMessage, cashout?: boolean) {
		// Remove all the reactions and end the LLRC
		await game.gameMessage.reactions.removeAll();
		game.llrc.end();

		// Should we need to cash out, proceed to doing that
		if (cashout!) {
			const { turn, wager } = game;
			// Let the user know, and nullify the embed
			await game.gameMessage.edit('Cashing out. Please hold...', { embed: null });

			// Calculate and deposit winnings for that game
			const winnings = this.calculateWinnings(wager, turn - 1);
			await message.author.settings.increase(UserSettings.Money, winnings);

			// Let the user know we're done!
			await game.gameMessage.edit(`Paid out ${winnings}${Emojis.Shiny} to your account. Have fun!`);
			return;
		}

		// Say bye!
		await game.gameMessage.edit(new MessageEmbed()
			.setColor('#DE0F1C')
			.setTitle('Game cancelled by choice')
			.setDescription(`Thanks for playing, ${message.author.username}! I'll be here when you want to play again`));
	}

	private reactionInhibitor(message: KlasaMessage, gameMessage: KlasaMessage, reaction: LLRCData) {
		// If there's no gameMessage, inhibit
		if (!gameMessage) return true;

		// If the message reacted is not the game's, inhibit
		if (reaction.messageID !== gameMessage.id) return true;

		// If the emoji reacted is not valid, inhibit
		if (!Object.values(ReactionEmoji).includes(reaction.emoji.name as ReactionEmoji)) return true;

		// If the user who reacted is the author, don't inhibit
		if (reaction.userID === message.author.id) return false;

		// Don't listen to herself
		if (reaction.userID === this.client.user!.id) return true;
	}

	/**
	 * @description Generates a random number between 0 and 100
	 * @param previous The number we shouldn't get (usually the number we're comparing against
	 */
	private random(previous?: number) {
		let number = previous!;
		while (number === previous) {
			number = (Math.random() * 100) | 0;
		}
		if (number > 100) number = 100;
		return number;
	}

	private calculateWinnings(bet: number, attempts: number) {
		if (attempts < 0) attempts = 1;
		return Math.round(bet * (attempts <= 4 ? (Math.exp(attempts)) / 6 : (attempts * 5) - 10));
	}

}

interface HigherLowerGameData {
	llrc: LongLivingReactionCollector;
	gameMessage: KlasaMessage;
	running: boolean;
	number: number;
	turn: number;
	wager: number;
}

interface EmojiPromiseContext {
	resolve: ((value?: ReactionEmoji) => void) | undefined;
	timeout: NodeJS.Timeout
}
