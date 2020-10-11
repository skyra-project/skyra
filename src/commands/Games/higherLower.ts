import { UserEntity } from '@lib/database/entities/UserEntity';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Time } from '@utils/constants';
import { LLRCData, LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import { resolveEmoji } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

const enum HigherLowerReactions {
	Higher = 'a:sarrow_up:658450971655012363',
	Lower = 'a:sarrow_down:658452292558913536',
	Cancel = ':redCross:637706251257511973',
	Ok = ':greenTick:637706251253317669',
	Cashout = '%F0%9F%92%B0' // 💰
}

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['hilo', 'higherlower', 'hl'],
	bucket: 2,
	cooldown: 7,
	description: (language) => language.get(LanguageKeys.Commands.Games.HigherLowerDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Games.HigherLowerExtended),
	requiredPermissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS'],
	runIn: ['text'],
	usage: '<wager:wager>'
})
export default class extends SkyraCommand {
	private readonly kFirstReactionArray = [HigherLowerReactions.Higher, HigherLowerReactions.Lower, HigherLowerReactions.Cancel] as const;
	private readonly kReactionArray = [HigherLowerReactions.Higher, HigherLowerReactions.Lower, HigherLowerReactions.Cashout] as const;
	private readonly kWinReactionArray = [HigherLowerReactions.Ok, HigherLowerReactions.Cancel] as const;
	private readonly kTimer = Time.Minute * 3;

	public async run(message: KlasaMessage, [wager]: [number]) {
		const { users } = await DbSet.connect();
		const settings = await users.ensure(message.author.id);
		const balance = settings.money;
		if (balance < wager) throw message.language.get(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });

		settings.money -= wager;
		await settings.save();

		const response = await message.sendLocale(LanguageKeys.Commands.Games.HigherLowerLoading);
		const game: HigherLowerGameData = {
			/** The game's reaction collector */
			llrc: new LongLivingReactionCollector(
				this.client,
				(reaction) => {
					if (game.callback === null) return;

					const emoji = this.resolveCollectedEmoji(message, game, reaction);
					if (emoji === null) return;

					game.callback(emoji);
					game.callback = null;
				},
				async () => {
					if (game.callback !== null) {
						game.callback(null);
						game.callback = null;
					}
					try {
						await this.end(game, message, settings);
					} catch (error) {
						this.client.emit(Events.Wtf, error);
					}
				}
			),
			response,
			running: true,
			turn: 1,
			number: this.random(50),
			wager,
			emojis: this.kFirstReactionArray,
			callback: null,
			color: await DbSet.fetchColor(message),
			canceledByChoice: false
		};

		while (game.running) {
			// Send the embed
			const { title: TITLE, description: DESCRIPTION, footer: FOOTER } = message.language.get(LanguageKeys.Commands.Games.HigherLowerEmbed, {
				turn: game.turn,
				number: game.number
			});
			await game.response.edit(
				null,
				new MessageEmbed() //
					.setColor(game.color)
					.setTitle(TITLE)
					.setDescription(DESCRIPTION)
					.setFooter(FOOTER)
			);

			// Add the options
			const emojis = game.turn > 1 ? this.kReactionArray : this.kFirstReactionArray;
			const emoji = await this.listenForReaction(game, emojis);
			if (emoji === null) break;

			// Main game logic (at last)
			const oldNum = game.number;
			game.number = this.random(oldNum);

			switch (emoji) {
				case HigherLowerReactions.Higher: {
					game.running = await (game.number > oldNum ? this.win(game, message, settings) : this.loss(game, message, settings));
					break;
				}
				case HigherLowerReactions.Lower: {
					game.running = await (game.number < oldNum ? this.win(game, message, settings) : this.loss(game, message, settings));
					break;
				}
				case HigherLowerReactions.Cancel:
				case HigherLowerReactions.Cashout: {
					game.canceledByChoice = true;
					await this.end(game, message, settings, emoji === HigherLowerReactions.Cashout);
					game.running = false;
					break;
				}
				case HigherLowerReactions.Ok:
					break;
			}

			if (game.running) game.turn++;
		}

		if (game.response.reactions.cache.size > 0) await game.response.reactions.removeAll();
		return game.response;
	}

	private async listenForReaction(game: HigherLowerGameData, emojis: readonly HigherLowerReactions[]) {
		if (game.response.reactions.cache.size > 0) await game.response.reactions.removeAll();

		game.emojis = emojis;
		for (const emoji of game.emojis) {
			await game.response.react(emoji);
		}

		return new Promise<HigherLowerReactions | null>((res) => {
			game.llrc.setTime(this.kTimer);
			game.callback = res;
		});
	}

	private async win(game: HigherLowerGameData, message: KlasaMessage, settings: UserEntity) {
		const { language } = message;

		const { title: TITLE, description: DESCRIPTION, footer: FOOTER } = message.language.get(LanguageKeys.Commands.Games.HigherLowerWin, {
			potentials: this.calculateWinnings(game.wager, game.turn),
			number: game.number
		});
		await game.response.edit(
			null,
			new MessageEmbed() //
				.setColor(game.color)
				.setTitle(TITLE)
				.setDescription(DESCRIPTION)
				.setFooter(FOOTER)
		);

		// Ask the user whether they want to continue or cashout
		const emoji = await this.listenForReaction(game, this.kWinReactionArray);

		// Decide whether we timeout, stop, or continue
		switch (emoji) {
			case null:
				game.llrc.end();
				await this.cashout(message, game, settings);
				break;
			case HigherLowerReactions.Ok:
				await game.response.edit(language.get(LanguageKeys.Commands.Games.HigherLowerNewround), { embed: null });
				break;
			case HigherLowerReactions.Cancel:
				await this.end(game, message, settings, true);
				break;
			default:
				throw new Error('Unreachable.');
		}

		return emoji === HigherLowerReactions.Ok;
	}

	private async loss(game: HigherLowerGameData, message: KlasaMessage, settings: UserEntity) {
		let losses = game.wager;

		// There's a 0.001% chance that a user would lose not only the wager, but also what they would've won in one round less.
		if (Math.random() < 0.0001) {
			losses += this.calculateWinnings(game.wager, game.turn - 1);
			settings.money -= losses;
			await settings.save();
		}

		const { title: TITLE, description: DESCRIPTION, footer: FOOTER } = message.language.get(LanguageKeys.Commands.Games.HigherLowerLose, {
			number: game.number,
			losses
		});
		await game.response.edit(
			null,
			new MessageEmbed() //
				.setColor(game.color)
				.setTitle(TITLE)
				.setDescription(DESCRIPTION)
				.setFooter(FOOTER)
		);

		game.llrc.end();
		return false;
	}

	private async end(game: HigherLowerGameData, message: KlasaMessage, settings: UserEntity, cashout = false) {
		// End the LLRC
		game.llrc.end();

		// Should we need to cash out, proceed to doing that
		if (cashout) return this.cashout(message, game, settings);

		if (game.canceledByChoice && game.turn === 1) {
			// Say bye!
			const { title: TITLE, description: DESCRIPTION } = message.language.get(LanguageKeys.Commands.Games.HigherLowerCancel, {
				username: message.author.username
			});

			await game.response.edit(
				null,
				new MessageEmbed() //
					.setColor(game.color)
					.setTitle(TITLE)
					.setDescription(DESCRIPTION)
			);
		}
	}

	private async cashout(message: KlasaMessage, game: HigherLowerGameData, settings: UserEntity) {
		const { turn, wager } = game;

		// Calculate and deposit winnings for that game
		const winnings = this.calculateWinnings(wager, turn - 1);
		settings.money += winnings;
		await settings.save();

		const { title: TITLE } = message.language.get(LanguageKeys.Commands.Games.HigherLowerWin, { potentials: 0, number: 0 });
		const { description: FOOTER } = message.language.get(LanguageKeys.Commands.Games.HigherLowerCancel, { username: message.author.username });

		// Let the user know we're done!
		await game.response.edit(
			null,
			new MessageEmbed()
				.setColor(game.color)
				.setTitle(TITLE)
				.setDescription(message.language.get(LanguageKeys.Commands.Games.HigherLowerCashout, { amount: winnings }))
				.setFooter(FOOTER)
		);
	}

	private resolveCollectedEmoji(message: KlasaMessage, game: HigherLowerGameData, reaction: LLRCData) {
		// If the message reacted is not the game's, inhibit
		if (reaction.messageID !== game.response.id) return null;

		// If the user who reacted was not the author, inhibit
		if (reaction.userID !== message.author.id) return null;

		// If the emoji reacted is not valid, inhibit
		const emoji = resolveEmoji(reaction.emoji);
		return emoji !== null && game.emojis.includes(emoji as HigherLowerReactions) ? (emoji as HigherLowerReactions) : null;
	}

	/**
	 * @description Generates a random number between 0 and 100
	 * @param previous The number we shouldn't get (usually the number we're comparing against
	 */
	private random(previous: number) {
		// Check if we're closer to 100 or 0
		const upperLimitIsClosest = previous > 50;

		// The proximity to the given edge
		const proximityToEdge = upperLimitIsClosest ? 99 - previous : previous - 1;
		const range = Math.min(30, proximityToEdge);

		const lower =
			proximityToEdge < 5
				? // If the proximity is less than 5
				  upperLimitIsClosest
					? // And we're closer to 100 then return a number in range [previous - 5..99]
					  this.randomInRange(previous - 5, 99)
					: // Otherwise return a number in range [1..previous + 5]
					  this.randomInRange(1, previous + 5)
				: // Else get the smaller number between 30 and the proximity to the edge
				  // And return a random number in the range of [previous - range..previous + range]
				  this.randomInRange(previous - range, previous + range);

		const higher = lower + 1;

		return previous === lower ? higher : lower;
	}

	/**
	 * Returns a random integer between minimum (inclusive) and maximum (inclusive).
	 * The value is no lower than min (or the next integer greater than min
	 * if min isn't an integer) and no greater than max (or the next integer
	 * lower than max if max isn't an integer).
	 * @param minimum The minimum boundary for the randomization
	 * @param maximum The maximum boundary for the randomization
	 */
	private randomInRange(minimum: number, maximum: number) {
		minimum = Math.ceil(minimum);
		maximum = Math.floor(maximum);
		return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
	}

	private calculateWinnings(bet: number, attempts: number) {
		if (attempts < 0) attempts = 1;
		return Math.round(bet * (attempts <= 4 ? Math.exp(attempts) / 6 : attempts * 5 - 10));
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
	canceledByChoice: boolean;
	color: number;
}
