import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';
import { LongLivingReactionCollector, LLRCData } from '../../lib/util/LongLivingReactionCollector';
import Collection from '@discordjs/collection';
import { TextChannel } from 'discord.js';

enum ReactionEmojis {
	HIGHER = '⬆',
	LOWER = '⬇',
	OK = '✔️',
	CANCEL = '❌',
	CASHOUT = '💰'
}

export default class extends SkyraCommand {

	private games: Collection<string, HigherLowerGameData> = new Collection();

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['hilo', 'higherlower', 'hl'],
			bucket: 2,
			cooldown: 7,
			description: `yadda yadda fill this out`,
			extendedHelp: `as well as this`,
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		if (this.games.has(message.author.id)) return message.send('you idiot. you have a game already');
		await message.author.settings.sync();
		const wager = Number(text);

		const reactArray = Object.values(ReactionEmojis);
		// Remove the cashout emoji
		reactArray.pop();

		const previousNumber = this.random();

		const gameMessage = await message.send(`Your number is ${previousNumber}. Will the next number be higher or lower?`);
		for (const emoji of reactArray) {
			await gameMessage.react(emoji);
		}
		this.games.set(message.author.id, Object.seal({
			llrc: new LongLivingReactionCollector(this.client, r => this.reactionHandler(r)).setTime(181000),
			wager,
			turn: 1,
			gameMessage: `${gameMessage.channel.id}.${gameMessage.id}`,
			user: message.author.id,
			previousNumber
		}));
	}

	private reactionHandler(reaction: LLRCData) {
		// If the reaction comes from herself... just dont
		if (reaction.userID === this.client.user!.id) return;
		// If the emoji reacted doesnt match our emojiset, just... don't
		if (!(Object.values(ReactionEmojis) as string[]).includes(reaction.emoji.name)) return;
		// If the message reacted to didn't correspond to a game's message, abort
		const gameMessage = this.games.find(g => g.gameMessage.split('.')[0] === reaction.channel.id);
		if (!gameMessage) return;
		// If the user that reacted to the message doesn't have a game, abort
		const gameData = this.games.get(reaction.userID);
		if (!gameData) return;
		// If the reaction user isnt the game user, ignore
		if (reaction.userID !== gameData.user) return;
		return this.gameHandler(reaction, gameData);
	}

	private async gameHandler(reaction: LLRCData, gameData: HigherLowerGameData) {
		const gameMessage = this.getGameMessage(gameData.gameMessage);
		await gameMessage!.reactions.removeAll();

		const winningNumber = this.random();
		switch (reaction.emoji.name) {
			case ReactionEmojis.HIGHER:
				if (winningNumber > gameData.previousNumber) return this.win(gameData, winningNumber);
				return this.loss(gameData, winningNumber);

			case ReactionEmojis.LOWER:
				if (winningNumber < gameData.previousNumber) return this.win(gameData, winningNumber);
				return this.loss(gameData, winningNumber);

			case ReactionEmojis.CASHOUT:
				// TODO: Implement cashout
				// this.cashout()
				break;

			default:
				break;
		}
	}

	private async loss(gameData: HigherLowerGameData, number: number) {
		// TODO (Quantum): Losing event
		/* const user = await this.client.users.fetch(gameData.user);
		const balance = user.settings.get(UserSettings.Money);
		await user.settings.update(UserSettings.Money, balance - gameData.wager); */
		gameData.llrc.end();
		const message = this.getGameMessage(gameData.gameMessage);
		await message?.edit(`you lost. number was ${number}`);
	}

	private async win(gameData: HigherLowerGameData, number: number) {
		// TODO (Quantum): Winning event
		gameData.llrc.end();
		const message = this.getGameMessage(gameData.gameMessage);
		await message?.edit(`you won. number was ${number}`);
	}

	private getGameMessage(id: string) {
		try {
			const [channelID, messageID] = id.split('.');
			return (this.client.channels.get(channelID) as TextChannel).messages.get(messageID);
		} catch (e) {
			console.log('fuck');
		}
	}

	private random() {
		return (Math.random() * 100) | 0;
	}

}

interface HigherLowerGameData {
	llrc: LongLivingReactionCollector;
	wager: number;
	turn: number;
	gameMessage: string;
	user: string;
	previousNumber: number;
}
