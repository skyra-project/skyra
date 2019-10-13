import { CommandStore, KlasaMessage, Language, util } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Events } from '../../lib/types/Enums';
import { HungerGamesUsage } from '../../lib/util/Games/HungerGamesUsage';
import { LLRCData, LongLivingReactionCollector } from '../../lib/util/LongLivingReactionCollector';
import { cleanMentions } from '../../lib/util/util';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

const EMOJIS = ['🇳', '🇾'];

export default class extends SkyraCommand {

	public playing: Set<string> = new Set();

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['hunger-games', 'hg'],
			cooldown: 0,
			description: language => language.tget('COMMAND_HUNGERGAMES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_HUNGERGAMES_EXTENDED'),
			requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '[user:string{2,50}] [...]',
			usageDelim: ',',
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, tributes: string[] = []) {
		const autoFilled = message.flagArgs.autofill;
		const autoSkip = message.flagArgs.autoskip;

		if (autoFilled) {
			const messages = await message.channel.messages.fetch({ limit: 100 });

			for (const { author } of messages.values()) {
				if (author && !tributes.includes(author.username)) tributes.push(author.username);
			}
		} else if (tributes.length === 0) {
			throw message.language.tget('COMMAND_GAMES_NO_PLAYERS', message.guild!.settings.get(GuildSettings.Prefix));
		}

		const filtered = new Set(tributes);
		if (filtered.size !== tributes.length) throw message.language.tget('COMMAND_GAMES_REPEAT');
		if (this.playing.has(message.channel.id)) throw message.language.tget('COMMAND_GAMES_PROGRESS');
		if (tributes.length < 4 || tributes.length > 48) throw message.language.tget('COMMAND_GAMES_TOO_MANY_OR_FEW', 4, 48);
		this.playing.add(message.channel.id);

		let resolve: ((value?: boolean) => void) | null = null;
		let gameMessage: KlasaMessage | null = null;
		const game: HungerGamesGame = Object.seal({
			bloodbath: true,
			llrc: new LongLivingReactionCollector(this.client, async reaction => {
				// Ignore if resolve is not ready
				if (typeof resolve !== 'function'
				// Run the collector inhibitor
				|| await this.collectorInhibitor(message, gameMessage!, reaction)) return;
				resolve(Boolean(EMOJIS.indexOf(reaction.emoji.name)));
				resolve = null;
			}, () => {
				if (typeof resolve === 'function') resolve(false);
				this.playing.delete(message.channel.id);
			}),
			sun: true,
			tributes: this.shuffle([...filtered].map(cleanMentions.bind(null, message.guild!))),
			turn: 0
		});

		try {
			while (game.tributes.size > 1) {
				// If it's not bloodbath and it became the day, increase the turn
				if (!game.bloodbath && game.sun) game.turn++;
				const events = game.bloodbath ? 'HG_BLOODBATH' : game.sun ? 'HG_DAY' : 'HG_NIGHT';

				// Main logic of the game
				const { results, deaths } = this.makeResultEvents(game, message.language.tget(events));
				const texts = this.buildTexts(message.language, game, results, deaths);

				// Ask for the user to proceed
				for (const text of texts) {
					game.llrc.setTime(120000);
					gameMessage = await message.channel.send(text) as KlasaMessage;
					for (const emoji of ['🇾', '🇳']) {
						gameMessage.react(emoji)
							.catch(error => this.client.emit(Events.ApiError, error));
					}
					const verification = await new Promise<boolean>(async res => {
						resolve = res;
						if (autoSkip) {
							await util.sleep((gameMessage!.content.length / 20) * 1000);
							res(true);
						}
					});
					gameMessage.nuke().catch(error => this.client.emit(Events.ApiError, error));
					if (!verification) {
						game.llrc.end();
						return message.sendLocale('COMMAND_HG_STOP');
					}
				}
				if (game.bloodbath) game.bloodbath = false;
				else game.sun = !game.sun;
			}

			// The match finished with one remaining player
			game.llrc.end();
			return message.sendLocale('COMMAND_HG_WINNER', [game.tributes.values().next().value]);
		} catch (err) {
			game.llrc.end();
			throw err;
		}
	}

	private async collectorInhibitor(message: KlasaMessage, gameMessage: KlasaMessage, reaction: LLRCData) {
		// If there's no gameMessage, inhibit
		if (!gameMessage) return true;

		// If the message reacted is not the game's, inhibit
		if (reaction.messageID !== gameMessage.id) return true;

		// If the emoji reacted is not valid, inhibit
		if (!EMOJIS.includes(reaction.emoji.name)) return true;

		// If the user who reacted is the author, don't inhibit
		if (reaction.userID === message.author!.id) return false;

		// Don't listen to herself
		if (reaction.userID === this.client.user!.id) return true;

		try {
			// Fetch the member for level measuring purposes
			const member = await message.guild!.members.fetch(reaction.userID);
			// Check if the user is a moderator
			const hasLevel = await KlasaMessage.prototype.hasAtLeastPermissionLevel.call({
				author: member.user, client: this.client, guild: member.guild, member
			}, 5);
			return !hasLevel;
		} catch {
			return true;
		}
	}

	private buildTexts(language: Language, game: HungerGamesGame, results: string[], deaths: string[]) {
		const header = language.tget('COMMAND_HG_RESULT_HEADER', game);
		const death = deaths.length ? `${language.tget('COMMAND_HG_RESULT_DEATHS', deaths.length)}\n\n${deaths.map(d => `- ${d}`).join('\n')}` : '';
		const proceed = language.tget('COMMAND_HG_RESULT_PROCEED');
		const panels = util.chunk(results, 5);

		const texts = panels.map(panel => `__**${header}:**__\n\n${panel.map(text => `- ${text}`).join('\n')}\n\n_${proceed}_`);
		if (deaths.length) texts.push(`${death}\n\n_${proceed}_`);
		return texts;
	}

	private pick(events: readonly HungerGamesUsage[], tributes: number, maxDeaths: number) {
		events = events.filter(event => event.tributes <= tributes && event.deaths.size <= maxDeaths);
		return events[Math.floor(Math.random() * events.length)];
	}

	private pickTributes(tribute: string, turn: Set<string>, amount: number) {
		if (amount === 0) return [];
		if (amount === 1) return [tribute];
		const array = [...turn];
		array.splice(array.indexOf(tribute), 1);

		let m = array.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[array[m], array[i]] = [array[i], array[m]];
		}
		array.unshift(tribute);
		return array.slice(0, amount);
	}

	private makeResultEvents(game: HungerGamesGame, events: readonly HungerGamesUsage[]) {
		const results = [] as string[];
		const deaths = [] as string[];
		let maxDeaths = this.calculateMaxDeaths(game);

		const turn = new Set([...game.tributes]);
		for (const tribute of game.tributes) {
			// If the player already had its turn, skip
			if (!turn.has(tribute)) continue;

			// Pick a valid event
			const event = this.pick(events, turn.size, maxDeaths);

			// Pick the tributes
			const pickedTributes = this.pickTributes(tribute, turn, event.tributes);

			// Delete all the picked tributes from this round
			for (const picked of pickedTributes) {
				turn.delete(picked);
			}

			// Kill all the unfortunate tributes
			for (const death of event.deaths) {
				game.tributes.delete(pickedTributes[death]);
				deaths.push(pickedTributes[death]);
				maxDeaths--;
			}

			// Push the result of this match
			results.push(event.display(...pickedTributes));
		}

		return { results, deaths };
	}

	private shuffle(tributes: string[]) {
		let m = tributes.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[tributes[m], tributes[i]] = [tributes[i], tributes[m]];
		}
		return new Set(tributes);
	}

	private calculateMaxDeaths(game: HungerGamesGame) {
		// If there are more than 16 tributes, perform a large blood bath
		return game.tributes.size >= 16
			// For 16 people, 4 die, 36 -> 6, and so on keeps the game interesting.
			// If it's in bloodbath, perform 50% more deaths.
			? Math.ceil(Math.sqrt(game.tributes.size) * (game.bloodbath ? 1.5 : 1))
			// If there are more than 7 tributes, proceed to kill them in 4 or more.
			: game.tributes.size > 7
				// If it's a bloodbath, perform mass death (12 -> 7), else eliminate 4.
				? game.bloodbath
					? Math.ceil(Math.min(game.tributes.size - 3, Math.sqrt(game.tributes.size) * 2))
					: 4
				// If there are 4 tributes, eliminate 2, else 1 (3 -> 2, 2 -> 1)
				: game.tributes.size === 4
					? 2
					: 1;
	}

}

export interface HungerGamesGame {
	bloodbath: boolean;
	llrc: LongLivingReactionCollector;
	sun: boolean;
	tributes: Set<string>;
	turn: number;
}
