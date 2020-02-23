import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { Time } from '@utils/constants';
import { LLRCData, LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import { getColor, resolveEmoji } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

const enum HigherLowerReactions {
	Higher = 'a:sarrow_up:658450971655012363',
	Lower = 'a:sarrow_down:658452292558913536',
	Cancel = ':redCross:637706251257511973',
	Ok = ':greenTick:637706251253317669',
	Cashout = '%F0%9F%92%B0' // 💰
}

export default class extends SkyraCommand {

	private readonly kFirstReactionArray = [HigherLowerReactions.Higher, HigherLowerReactions.Lower, HigherLowerReactions.Cancel] as const;
	private readonly kReactionArray = [HigherLowerReactions.Higher, HigherLowerReactions.Lower, HigherLowerReactions.Cashout] as const;
	private readonly kWinReactionArray = [HigherLowerReactions.Ok, HigherLowerReactions.Cancel] as const;
	private readonly kTimer = Time.Minute * 3;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['hilo', 'higherlower', 'hl'],
			bucket: 2,
			cooldown: 7,
			description: language => language.tget('COMMAND_HIGHERLOWER_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_HIGHERLOWER_EXTENDED'),
			requiredPermissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		await message.author.settings.sync();

		const wager = Number(text);
		const balance = message.author.settings.get(UserSettings.Money);
		if (balance < wager) throw message.language.tget('GAMES_NOT_ENOUGH_MONEY', balance);
		await message.author.decreaseBalance(wager);

		const response = await message.sendLocale('COMMAND_HIGHERLOWER_LOADING');
		const game: HigherLowerGameData = {
			/** The game's reaction collector */
			llrc: new LongLivingReactionCollector(this.client, reaction => {
				if (game.callback === null) return;

				const emoji = this.resolveCollectedEmoji(message, game, reaction);
				if (emoji === null) return;

				game.callback(emoji);
				game.callback = null;
			}, async () => {
				if (game.callback !== null) {
					game.callback(null);
					game.callback = null;
				}
				try {
					await this.end(game, message, game.turn > 1);
				} catch (error) {
					this.client.emit(Events.Wtf, error);
				}
			}),
			response,
			running: true,
			turn: 1,
			number: this.random(0),
			wager,
			emojis: this.kFirstReactionArray,
			callback: null,
			color: getColor(message)
		};

		while (game.running) {
			// Send the embed
			const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_EMBED');
			await game.response.edit(null, new MessageEmbed()
				.setColor(game.color)
				.setTitle(TITLE(game.turn))
				.setDescription(DESCRIPTION(game.number))
				.setFooter(FOOTER));

			// Add the options
			const emojis = game.turn > 1 ? this.kReactionArray : this.kFirstReactionArray;
			const emoji = await this.listenForReaction(game, emojis);
			if (emoji === null) break;

			// Main game logic (at last)
			const oldNum = game.number;
			game.number = this.random(game.number);

			switch (emoji) {
				case HigherLowerReactions.Higher: {
					game.running = await (game.number > oldNum ? this.win(game, message) : this.loss(game, message));
					break;
				}
				case HigherLowerReactions.Lower: {
					game.running = await (game.number < oldNum ? this.win(game, message) : this.loss(game, message));
					break;
				}
				case HigherLowerReactions.Cancel:
				case HigherLowerReactions.Cashout: {
					await this.end(game, message, emoji === HigherLowerReactions.Cashout);
					game.running = false;
					break;
				}
			}

			if (game.running) game.turn++;
		}

		if (game.response.reactions.size > 0) await game.response.reactions.removeAll();
		return game.response;
	}

	private async listenForReaction(game: HigherLowerGameData, emojis: readonly HigherLowerReactions[]) {
		if (game.response.reactions.size > 0) await game.response.reactions.removeAll();

		game.emojis = emojis;
		for (const emoji of game.emojis) {
			await game.response.react(emoji);
		}

		return new Promise<HigherLowerReactions | null>(res => {
			game.llrc.setTime(this.kTimer);
			game.callback = res;
		});
	}

	private async win(game: HigherLowerGameData, message: KlasaMessage) {
		const { language } = message;

		const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_WIN');
		await game.response.edit(null, new MessageEmbed()
			.setColor(game.color)
			.setTitle(TITLE)
			.setDescription(DESCRIPTION(this.calculateWinnings(game.wager, game.turn), game.number))
			.setFooter(FOOTER));

		// Ask the user whether they want to continue or cashout
		const emoji = await this.listenForReaction(game, this.kWinReactionArray);

		// Decide whether we timeout, stop, or continue
		switch (emoji) {
			case null:
				game.llrc.end();
				await this.cashout(message, game);
				break;
			case HigherLowerReactions.Ok:
				await game.response.edit(language.tget('COMMAND_HIGHERLOWER_NEWROUND'), { embed: null });
				break;
			case HigherLowerReactions.Cancel:
				await this.end(game, message, true);
				break;
			default:
				throw new Error('Unreachable.');
		}

		return emoji === HigherLowerReactions.Ok;
	}

	private async loss(game: HigherLowerGameData, message: KlasaMessage) {
		let losses = game.wager;

		// There's a 0.001% chance that a user would lose now only the wager, but also what they would've won in one round less.
		if ((Math.random()) < 0.0001) {
			losses += this.calculateWinnings(game.wager, game.turn - 1);
			await message.author.decreaseBalance(losses);
		}

		const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_LOSE');
		await game.response.edit(null, new MessageEmbed()
			.setColor(game.color)
			.setTitle(TITLE)
			.setDescription(DESCRIPTION(game.number, losses))
			.setFooter(FOOTER));

		game.llrc.end();
		return false;
	}

	private async end(game: HigherLowerGameData, message: KlasaMessage, cashout: boolean) {
		// End the LLRC
		game.llrc.end();

		// Should we need to cash out, proceed to doing that
		if (cashout) return this.cashout(message, game);

		// Say bye!
		const { TITLE, DESCRIPTION } = message.language.tget('COMMAND_HIGHERLOWER_CANCEL');
		await game.response.edit(null, new MessageEmbed()
			.setColor(game.color)
			.setTitle(TITLE)
			.setDescription(DESCRIPTION(message.author.username)));
	}

	private async cashout(message: KlasaMessage, game: HigherLowerGameData) {
		const { turn, wager } = game;

		// Calculate and deposit winnings for that game
		const winnings = this.calculateWinnings(wager, turn - 1);
		await message.author.increaseBalance(winnings);

		// Let the user know we're done!
		await game.response.edit(message.language.tget('COMMAND_HIGHERLOWER_CASHOUT', winnings), { embed: null });
	}

	private resolveCollectedEmoji(message: KlasaMessage, game: HigherLowerGameData, reaction: LLRCData) {
		// If the message reacted is not the game's, inhibit
		if (reaction.messageID !== game.response.id) return null;

		// If the user who reacted was not the author, inhibit
		if (reaction.userID !== message.author.id) return null;

		// If the emoji reacted is not valid, inhibit
		const emoji = resolveEmoji(reaction.emoji);
		return emoji !== null && game.emojis.includes(emoji as HigherLowerReactions)
			? emoji as HigherLowerReactions
			: null;
	}

	/**
	 * @description Generates a random number between 0 and 100
	 * @param previous The number we shouldn't get (usually the number we're comparing against
	 */
	private random(previous: number) {
		// Retrieve a number in the range [0..100)
		const random = Math.random() * 100;

		// Retrieve a number in the range [0..99]
		const lower = Math.floor(random);

		// Retrieve a number in the range [1..100]
		const higher = lower + 1;

		/**
		 * We use both lower (floor(random)) and higher (ceil(random)), the code is done this way to avoid looping
		 * until we get a random number different to previous, which is costy and has many bad cases, the following
		 * algorithm has a constant performance cost.
		 *
		 * We check if previous equals to the lower bound of the random number, if it does, we pick the next integer,
		 * otherwise we pick the lower.
		 *
		 * @example
		 * // Different numbers
		 * random; // 70.4
		 * 54 === 70 ? 71 : 70; // -> 70
		 *
		 * @example
		 * // Same lower
		 * random; // -> 55.3
		 * 55 === 55 ? 56 : 55; // -> 56
		 *
		 * @example
		 * // Lowest boundary
		 * random; // 0.4
		 * 0 === 0 ? 1 : 0; // -> 1
		 *
		 * @example
		 * // Low boundary
		 * random; // 0.4
		 * 1 === 0 ? 1 : 0; // -> 0
		 *
		 * @example
		 * // Highest boundary
		 * random; // 99.4
		 * 100 === 99 ? 100 : 99; // -> 99
		 *
		 * @example
		 * // High boundary
		 * random; // 99.4
		 * 99 === 99 ? 100 : 99; // -> 100
		 */
		return previous === lower
			? higher
			: lower;
	}

	private calculateWinnings(bet: number, attempts: number) {
		if (attempts < 0) attempts = 1;
		return Math.round(bet * (attempts <= 4 ? (Math.exp(attempts)) / 6 : (attempts * 5) - 10));
	}

}

interface HigherLowerGameData {
	llrc: LongLivingReactionCollector;
	response: KlasaMessage;
	running: boolean;
	number: number;
	turn: number;
	wager: number;
	emojis: readonly HigherLowerReactions[];
	callback: ((value: HigherLowerReactions | null) => void) | null;
	color: number;
}
