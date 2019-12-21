import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { LongLivingReactionCollector, LLRCData } from '../../lib/util/LongLivingReactionCollector';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { Time } from '../../lib/util/constants';
import { getColor } from '../../lib/util/util';
import { Events } from '../../lib/types/Enums';

enum ReactionEmoji {
	HIGHER = '⬆',
	LOWER = '⬇',
	CANCEL = '<:redCross:637706251257511973>',
	OK = '<:greenTick:637706251253317669>',
	CASHOUT = '💰'
}

const enum EndingAction {
	PLAY,
	STOP,
	TIMEOUT
}

export default class extends SkyraCommand {

	private kFirstReactionArray = [ReactionEmoji.HIGHER, ReactionEmoji.LOWER, ReactionEmoji.CANCEL];
	private kReactionArray = [ReactionEmoji.HIGHER, ReactionEmoji.LOWER, ReactionEmoji.CASHOUT];
	private kWinReactionArray = [ReactionEmoji.OK, ReactionEmoji.CANCEL];

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['hilo', 'higherlower', 'hl'],
			bucket: 2,
			cooldown: 7,
			description: language => language.tget('COMMAND_HIGHERLOWER_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_HIGHERLOWER_EXTENDED'),
			requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		const wager = Number(text);
		const balance = message.author.settings.get(UserSettings.Money);
		if (balance < wager) throw message.language.tget('GAMES_NOT_ENOUGH_MONEY', balance);

		let emojiPromiseContext: EmojiPromiseContext = { resolve: undefined, timeout: undefined };

		const game: HigherLowerGameData = Object.seal({
			/** The game's reaction collector */
			llrc: null,
			gameMessage: await message.sendLocale('COMMAND_HIGHERLOWER_LOADING'),
			running: true,
			turn: 1,
			number: this.random(),
			wager
		});

		game.llrc = new LongLivingReactionCollector(this.client, this.reactionCollector.bind(this, emojiPromiseContext, message, game));

		while (game.running) {
			await game.gameMessage.reactions.removeAll();
			// Send the embed
			const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_EMBED');
			await game.gameMessage.edit({
				content: null,
				embed: new MessageEmbed()
					.setColor(getColor(message))
					.setTitle(TITLE(game.turn))
					.setDescription(DESCRIPTION(game.number))
					.setFooter(FOOTER)
			});

			// Add the options
			const reactArray = game.turn > 1 ? this.kReactionArray : this.kFirstReactionArray;
			for (const emoji of reactArray) {
				await game.gameMessage.react(emoji);
			}

			// Grab the user selection
			const emojiSelected = await new Promise<ReactionEmoji>(resolve => {
				// Create the timeout
				const timeout = this.client.setTimeout(async () => {
					try {
						await this.end(game, message, game.turn > 1);
					} catch (error) {
						this.client.emit(Events.Wtf, error);
					}

				}, 3 * Time.Minute);

				// Insert weird promise tomfoolery. I still havent completely understood how this works. Something something weird promise resolves
				emojiPromiseContext = {
					resolve,
					timeout
				};
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
		const { author: user, language } = message;
		await game.gameMessage.reactions.removeAll();

		// TODO(Quantum): Implement Winning event for InfluxDB
		const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_WIN');
		await game.gameMessage.edit({
			content: null,
			embed: new MessageEmbed()
				.setColor(getColor(message))
				.setTitle(TITLE)
				.setDescription(DESCRIPTION(this.calculateWinnings(game.wager, game.turn), game.number))
				.setFooter(FOOTER)
		});

		// Ask the user whether they want to continue or cashout
		for (const emoji of this.kWinReactionArray) {
			await game.gameMessage.react(emoji);
		}
		const reactionMap = await game.gameMessage.awaitReactions((r, u) => this.kWinReactionArray.includes(r.emoji.name) && u.id === user.id, { max: 1, time: 1.5 * Time.Minute });
		await game.gameMessage.reactions.removeAll();

		const whatToDo = reactionMap.size === 0
			? EndingAction.TIMEOUT
			: reactionMap.first()!.emoji.name === ReactionEmoji.OK
				? EndingAction.PLAY
				: EndingAction.STOP;

		// Decide whether we timeout, stop, or continue
		switch (whatToDo) {
			case EndingAction.TIMEOUT:
				await game.gameMessage.edit(language.tget('COMMAND_HIGHERLOWER_TIMEOUT'), { embed: null });
			case EndingAction.STOP:
				await this.end(game, message, true);
				break;
			case EndingAction.PLAY:
				await game.gameMessage.edit(language.tget('COMMAND_HIGHERLOWER_NEWROUND'), { embed: null });
				break;
		}
		return whatToDo === EndingAction.PLAY;
	}

	private async loss(game: HigherLowerGameData, message: KlasaMessage) {
		// TODO (Quantum): Implement losing event to InfluxDB
		const { number, wager, turn, gameMessage } = game;
		await gameMessage.reactions.removeAll();
		let losses = wager;

		// There's a 0.1% chance that a user would lose now only the wager, but also what they would've won. Muahaha
		if ((Math.random()) < 0.001) {
			losses += this.calculateWinnings(wager, turn - 1);
			await message.author.settings.decrease(UserSettings.Money, losses);
		}


		const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_LOSE');
		await game.gameMessage.edit({
			content: null,
			embed: new MessageEmbed()
				.setColor(getColor(message))
				.setTitle(TITLE)
				.setDescription(DESCRIPTION(number, losses))
				.setFooter(FOOTER)
		});
		return false;
	}

	private async end(game: HigherLowerGameData, message: KlasaMessage, cashout?: boolean) {
		// Remove all the reactions and end the LLRC
		await game.gameMessage.reactions.removeAll();
		game.llrc!.end();

		// Should we need to cash out, proceed to doing that
		if (cashout!) {
			const { turn, wager } = game;
			// Let the user know, and nullify the embed
			await game.gameMessage.edit(message.language.tget('COMMAND_HIGHERLOWER_CASHOUT_INIT'), { embed: null });

			// Calculate and deposit winnings for that game
			const winnings = this.calculateWinnings(wager, turn - 1);
			await message.author.settings.increase(UserSettings.Money, winnings);

			// Let the user know we're done!
			await game.gameMessage.edit(message.language.tget('COMMAND_HIGHERLOWER_CASHOUT', winnings));
			return;
		}

		// Say bye!
		const { TITLE, DESCRIPTION } = message.language.tget('COMMAND_HIGHERLOWER_CANCEL');
		await game.gameMessage.edit({
			content: null,
			embed: new MessageEmbed()
				.setColor(getColor(message))
				.setTitle(TITLE)
				.setDescription(DESCRIPTION(message.author.username))
		});
	}

	private async reactionCollector(ctx: EmojiPromiseContext, message: KlasaMessage, game: HigherLowerGameData, reaction: LLRCData) {
		// Ignore if resolve is not ready
		if (typeof ctx.resolve !== 'function'
						// Run the collector inhibitor
						|| await this.reactionInhibitor(message, game.gameMessage!, reaction)) return;
		this.client.clearTimeout(ctx.timeout!);
		ctx.resolve(reaction.emoji.name as ReactionEmoji);
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
	llrc: LongLivingReactionCollector | null;
	gameMessage: KlasaMessage;
	running: boolean;
	number: number;
	turn: number;
	wager: number;
}

interface EmojiPromiseContext {
	resolve: ((value?: ReactionEmoji) => void) | undefined;
	timeout: NodeJS.Timeout | undefined;
}
