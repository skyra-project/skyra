import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';
import { LongLivingReactionCollector, LLRCData } from '../../lib/util/LongLivingReactionCollector';
import Collection from '@discordjs/collection';
import { TextChannel, Message, MessageEmbed } from 'discord.js';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { Emojis } from '../../lib/util/constants';
import { getColor } from '../../lib/util/util';

enum ReactionEmoji {
	HIGHER = '⬆',
	LOWER = '⬇',
	CANCEL = '❌',
	OK = '✔️',
	CASHOUT = '💰'
}

const enum endingAction {
	PLAY,
	STOP,
	TIMEOUT
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
		const balance = await message.author.settings.get(UserSettings.Money);
		if (wager > balance) throw message.language.tget('COMMAND_SLOTMACHINES_MONEY', balance);
		// Todo (Quantum): Log transaction
		await message.author.settings.decrease(UserSettings.Money, wager);

		await this.newRound(this.random(), message, undefined, message.channel.id, message.author.id, wager);
	}

	private reactionHandler(reaction: LLRCData) {
		// If the reaction comes from herself... just dont
		if (reaction.userID === this.client.user!.id) return;
		// If the emoji reacted doesnt match our emojiset, just... don't
		if (!(Object.values(ReactionEmoji) as string[]).includes(reaction.emoji.name)) return;
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
		await gameMessage.reactions.removeAll();
		gameData.llrc.end();

		const winningNumber = this.random();
		switch (reaction.emoji.name) {
			case ReactionEmoji.HIGHER:
				if (winningNumber > gameData.previousNumber) return this.win(gameData, winningNumber);
				return this.loss(gameData, winningNumber);

			case ReactionEmoji.LOWER:
				if (winningNumber < gameData.previousNumber) return this.win(gameData, winningNumber);
				return this.loss(gameData, winningNumber);

			case ReactionEmoji.CASHOUT:
				await this.cashout(gameData, gameMessage);
				break;

			case ReactionEmoji.CANCEL:
				this.games.delete(gameData.user);
				await gameMessage.edit('Game cancelled. See you again next time!');
				break;
			default:
				break;
		}
	}

	private async newRound(previousNumber: number, message: Message, previousGameData?: HigherLowerGameData, channelID?: string, userID?: string, wagerIn?: number) {
		// Maybe use a function for this?
		const channel = typeof channelID === 'undefined'
			? typeof previousGameData === 'undefined'
				? null
				: this.client.channels.get(previousGameData.gameMessage.split('.')[0]) as TextChannel
			: this.client.channels.get(channelID) as TextChannel;
		if (channel === null || channel === undefined) throw new Error('No channel provided');

		const user = typeof userID === 'undefined'
			? typeof previousGameData === 'undefined'
				? null
				: previousGameData.user
			: userID;
		if (user === null) throw new Error('No user provided');

		const wager = typeof wagerIn === 'undefined'
			? typeof previousGameData === 'undefined'
				? null
				: previousGameData.wager
			: wagerIn;
		if (wager === null) throw new Error('No wager provided');

		const turn = typeof previousGameData === 'undefined'
			? 1
			: previousGameData.turn + 1;

		const filterFunc = typeof previousGameData === 'undefined'
			? (e: ReactionEmoji) => e !== ReactionEmoji.OK && e !== ReactionEmoji.CASHOUT
			: (e: ReactionEmoji) => e !== ReactionEmoji.OK && e !== ReactionEmoji.CANCEL;
		const reactArray = Object.values(ReactionEmoji).filter(filterFunc);

		if (typeof previousGameData === 'undefined' && message === undefined) throw new Error('Message wasn\'t provided');
		const gameMessage = typeof previousGameData === 'undefined'
			? await channel.send(new MessageEmbed()
				.setColor(getColor(message as KlasaMessage))
				.setTitle(`Higher or Lower? | Turn 1`)
				.setDescription(`Your number is ${previousNumber}. Will the next number be higher or lower?`)
				.setFooter('The game will expire in 3 minutes, so act fast!'))
			: await this.getGameMessage(previousGameData.gameMessage).edit({
				content: '',
				embed: new MessageEmbed()
					.setColor(getColor(message as KlasaMessage))
					.setTitle(`Higher or Lower? | Turn ${previousGameData!.turn}`)
					.setDescription(`Your number was ${previousNumber}. Will the next number be higher or lower?`)
					.setFooter('The game will expire in 3 minutes, so act fast!')
			});

		for (const emoji of reactArray) {
			await gameMessage.react(emoji);
		}

		const gameData = Object.seal({
			llrc: new LongLivingReactionCollector(this.client, r => this.reactionHandler(r)).setTime(180000),
			gameMessage: `${gameMessage.channel.id}.${gameMessage.id}`,
			authorMessage: message as KlasaMessage,
			wager,
			turn,
			user,
			previousNumber
		});

		this.games.set(user, gameData);
	}

	private async loss(gameData: HigherLowerGameData, number: number) {
		// TODO (Quantum): Losing event
		this.games.delete(gameData.user);
		const message = this.getGameMessage(gameData.gameMessage);
		await message.edit({
			content: '',
			embed: new MessageEmbed()
				.setColor(getColor(message as KlasaMessage))
				.setTitle(`Your lost :\(`)
				.setDescription(`You didn't quite get it. The number was ${number}. You lost ${gameData.wager}${Emojis.Shiny}`)
				.setFooter('Better luck next time!')
		});
	}

	private async win(gameData: HigherLowerGameData, number: number) {
		// TODO (Quantum): Winning event

		const message = this.getGameMessage(gameData.gameMessage);
		await message.edit({
			content: '',
			embed: new MessageEmbed()
				.setColor(getColor(message as KlasaMessage))
				.setTitle(`Your won!`)
				.setDescription(`You did it! The number was ${number}. Want to continue? ${this.calculateWinnings(gameData.wager, gameData.turn)}${Emojis.Shiny} are on the line`)
				.setFooter('Act fast! You don\'t have much time')
		});
		const reactArray = Object.values(ReactionEmoji).filter(e => e !== ReactionEmoji.HIGHER && e !== ReactionEmoji.LOWER && e !== ReactionEmoji.CASHOUT);
		for (const emoji of reactArray) {
			await message.react(emoji);
		}

		const reactionMap = await message.awaitReactions((r, u) => reactArray.includes(r.emoji.name) && u.id === gameData.user, { max: 1, time: 10000 });
		await message.reactions.removeAll();

		const whatToDo = typeof reactionMap.first() === 'undefined'
			? endingAction.TIMEOUT
			: reactionMap.first()?.emoji.name === ReactionEmoji.OK
				? endingAction.PLAY
				: endingAction.STOP;
		switch (whatToDo) {
			case endingAction.TIMEOUT:
				await message.edit('Prompt timed out. Cashing out winnings...', { embed: null });
			case endingAction.STOP:
				await this.cashout(gameData, message);
				break;
			case endingAction.PLAY:
				await message.edit('Alright. Starting new round');
				await this.newRound(number, gameData.authorMessage, gameData);
				break;
		}
	}

	private async cashout(gameData: HigherLowerGameData, message: Message) {
		const { turn, wager, user } = gameData;
		await message.edit('Cashing out. Please hold...', { embed: null });
		const winnings = this.calculateWinnings(wager, turn - 1);
		const { settings } = (await this.client.users.get(user))!;
		if (!settings) await message.edit('Unknown issue while paying out! Please contact our admins');
		await settings.increase(UserSettings.Money, winnings);
		await message.edit(`Paid out ${winnings}${Emojis.Shiny} to your account. Have fun!`);
	}

	private getGameMessage(id: string) {
		const [channelID, messageID] = id.split('.');
		const message = (this.client.channels.get(channelID) as TextChannel).messages.get(messageID);
		if (typeof message === 'undefined') throw new Error('No GameMessage found');
		return message;
	}

	private random() {
		return (Math.random() * 100) | 0;
	}

	private calculateWinnings(bet: number, attempts: number) {
		if (attempts < 0) attempts = 1;
		return Math.round(bet * (attempts <= 4 ? (Math.exp(attempts)) / 6 : (attempts * 5) - 10));
	}

}

interface HigherLowerGameData {
	llrc: LongLivingReactionCollector;
	wager: number;
	turn: number;
	gameMessage: string;
	authorMessage: KlasaMessage;
	user: string;
	previousNumber: number;
}
