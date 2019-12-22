import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Events } from '../../lib/types/Enums';
import { UserSettings } from '../../lib/types/settings/UserSettings';
import { Time } from '../../lib/util/constants';
import { LLRCData, LongLivingReactionCollector } from '../../lib/util/LongLivingReactionCollector';
import { getColor, resolveEmoji } from '../../lib/util/util';

const enum HigherLowerReactions {
	Higher = 'a:sarrow_up:658450971655012363',
	Lower = 'a:sarrow_down:658452292558913536',
	Cancel = ':redCross:637706251257511973',
	Ok = ':greenTick:637706251253317669',
	Cashout = '%F0%9F%92%B0' // 💰
}

const enum EndingAction {
	Play,
	Stop,
	Timeout
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
			requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		await message.author.settings.sync();

		const wager = Number(text);
		const balance = message.author.settings.get(UserSettings.Money);
		if (balance < wager) throw message.language.tget('GAMES_NOT_ENOUGH_MONEY', balance);

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
			number: this.random(),
			wager,
			emojis: this.kFirstReactionArray,
			callback: null
		};

		while (game.running) {
			await game.response.reactions.removeAll();
			// Send the embed
			const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_EMBED');
			await game.response.edit(null, new MessageEmbed()
				.setColor(getColor(message))
				.setTitle(TITLE(game.turn))
				.setDescription(DESCRIPTION(game.number))
				.setFooter(FOOTER));

			// Add the options
			if (game.turn > 1) game.emojis = this.kReactionArray;
			for (const emoji of game.emojis) {
				await game.response.react(emoji);
			}

			const emoji = await this.awaitReactionAction(game);
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
				case HigherLowerReactions.Cashout: {
					await this.end(game, message, true);
					game.running = false;
					break;
				}
			}

			if (game.running) game.turn++;
		}
	}

	private async win(game: HigherLowerGameData, message: KlasaMessage) {
		const { language } = message;
		await game.response.reactions.removeAll();

		// TODO(Quantum): Implement Winning event for InfluxDB
		const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_WIN');
		await game.response.edit(null, new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(TITLE)
			.setDescription(DESCRIPTION(this.calculateWinnings(game.wager, game.turn), game.number))
			.setFooter(FOOTER));

		// Ask the user whether they want to continue or cashout
		game.emojis = this.kWinReactionArray;
		for (const emoji of game.emojis) {
			await game.response.react(emoji);
		}

		const reaction = await this.awaitReactionAction(game);
		await game.response.reactions.removeAll();

		const action = reaction === null
			? EndingAction.Timeout
			: reaction === HigherLowerReactions.Ok
				? EndingAction.Play
				: EndingAction.Stop;

		// Decide whether we timeout, stop, or continue
		switch (action) {
			case EndingAction.Timeout:
				await game.response.edit(language.tget('COMMAND_HIGHERLOWER_TIMEOUT'), { embed: null });
			case EndingAction.Stop:
				await this.end(game, message, true);
				break;
			case EndingAction.Play:
				await game.response.edit(language.tget('COMMAND_HIGHERLOWER_NEWROUND'), { embed: null });
				break;
		}
		return action === EndingAction.Play;
	}

	private async loss(game: HigherLowerGameData, message: KlasaMessage) {
		// TODO (Quantum): Implement losing event to InfluxDB
		const { number, wager, turn, response } = game;
		await response.reactions.removeAll();
		let losses = wager;

		// There's a 0.1% chance that a user would lose now only the wager, but also what they would've won. Muahaha
		if ((Math.random()) < 0.001) {
			losses += this.calculateWinnings(wager, turn - 1);
			await message.author.settings.decrease(UserSettings.Money, losses);
		}

		const { TITLE, DESCRIPTION, FOOTER } = message.language.tget('COMMAND_HIGHERLOWER_LOSE');
		await game.response.edit(null, new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(TITLE)
			.setDescription(DESCRIPTION(number, losses))
			.setFooter(FOOTER));
		return false;
	}

	private async end(game: HigherLowerGameData, message: KlasaMessage, cashout: boolean) {
		// Remove all the reactions and end the LLRC
		await game.response.reactions.removeAll();
		game.llrc.end();

		// Should we need to cash out, proceed to doing that
		if (cashout) {
			const { turn, wager } = game;
			// Let the user know, and nullify the embed
			await game.response.edit(message.language.tget('COMMAND_HIGHERLOWER_CASHOUT_INIT'), { embed: null });

			// Calculate and deposit winnings for that game
			const winnings = this.calculateWinnings(wager, turn - 1);
			await message.author.settings.increase(UserSettings.Money, winnings);

			// Let the user know we're done!
			await game.response.edit(message.language.tget('COMMAND_HIGHERLOWER_CASHOUT', winnings));
			return;
		}

		// Say bye!
		const { TITLE, DESCRIPTION } = message.language.tget('COMMAND_HIGHERLOWER_CANCEL');
		await game.response.edit(null, new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(TITLE)
			.setDescription(DESCRIPTION(message.author.username)));
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

	private awaitReactionAction(game: HigherLowerGameData) {
		return new Promise<HigherLowerReactions | null>(res => {
			game.llrc.setTime(this.kTimer);
			game.callback = res;
		});
	}

	/**
	 * @description Generates a random number between 0 and 100
	 * @param previous The number we shouldn't get (usually the number we're comparing against
	 */
	private random(previous?: number) {
		if (typeof previous === 'undefined') {
			return Math.ceil(Math.random() * 100);
		}

		const higher = Math.random() > 0.5;
		return higher
			? Math.ceil(Math.random() * previous)
			: Math.ceil(Math.random() * (100 - previous)) + previous;
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
}
