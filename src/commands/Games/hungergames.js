const { Command, klasaUtil: { chunk }, LongLivingReactionCollector, util: { cleanMentions }, KlasaMessage } = require('../../index');
const EMOJIS = ['🇳', '🇾'];

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['hunger-games', 'hg'],
			requiredPermissions: ['ADD_REACTIONS'],
			cooldown: 0,
			description: (language) => language.get('COMMAND_HUNGERGAMES_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_HUNGERGAMES_EXTENDED'),
			runIn: ['text'],
			usage: '<user:string{2,50}> [...]',
			usageDelim: ' '
		});

		this.playing = new Set();
	}

	async collectorInhibitor(msg, gameMessage, reaction) {
		// If there's no gameMessage, inhibit
		if (!gameMessage) return true;

		// If the message reacted is not the game's, inhibit
		if (reaction.messageID !== gameMessage.id) return true;

		// If the emoji reacted is not valid, inhibit
		if (!EMOJIS.includes(reaction.emoji.name)) return true;

		// If the user who reacted is the author, don't inhibit
		if (reaction.userID === msg.author.id) return false;

		try {
			// Fetch the member for level measuring purposes
			const member = await msg.guild.members.fetch(reaction.userID);
			// Check if the user is a moderator
			const hasLevel = await KlasaMessage.prototype.hasAtLeastPermissionLevel.call({
				author: member.user, member, guild: member.guild, client: this.client
			}, 5);
			return !hasLevel;
		} catch (__) {
			return true;
		}
	}

	async run(msg, tributes) {
		const filtered = new Set(tributes);
		if (filtered.size !== tributes.length) throw msg.language.get('COMMAND_GAMES_REPEAT');
		if (this.playing.has(msg.channel.id)) throw msg.language.get('COMMAND_GAMES_PROGRESS');
		if (tributes.length < 4 || tributes.length > 48) throw msg.language.get('COMMAND_GAMES_TOO_MANY_OR_FEW', 4, 48);
		this.playing.add(msg.channel.id);

		let resolve = null;
		let gameMessage = null;
		const game = Object.seal({
			bloodbath: true,
			sun: true,
			tributes: this.shuffle([...filtered].map(cleanMentions.bind(null, msg))),
			turn: 0,
			llrc: new LongLivingReactionCollector(this.client, async (reaction) => {
				// Ignore if resolve is not ready
				if (typeof resolve !== 'function'
					// Run the collector inhibitor
					|| await this.collectorInhibitor(msg, gameMessage, reaction)) return;
				resolve(Boolean(EMOJIS.indexOf(reaction.emoji.name)));
				resolve = null;
			}, () => {
				if (typeof resolve === 'function') resolve(false);
				this.playing.delete(msg.channel.id);
			})
		});

		try {
			while (game.tributes.size > 1) {
				// If it's not bloodbath and it became the day, increase the turn
				if (!game.bloodbath && game.sun) game.turn++;
				const events = game.bloodbath ? 'HG_BLOODBATH' : game.sun ? 'HG_DAY' : 'HG_NIGHT';

				// Main logic of the game
				const { results, deaths } = this.makeResultEvents(msg, game, msg.language.get(events));
				const texts = this.buildTexts(msg.language, game, results, deaths);

				// Ask for the user to proceed
				for (const text of texts) {
					game.llrc.setTime(120000);
					gameMessage = await msg.channel.send(text);
					for (const emoji of ['🇾', '🇳']) gameMessage.react(emoji);
					const verification = await new Promise((res) => { resolve = res; });
					gameMessage.nuke().catch(error => this.client.emit('apiError', error));
					if (!verification) {
						game.llrc.end();
						return msg.sendLocale('COMMAND_HG_STOP');
					}
				}
				if (!game.bloodbath) game.sun = !game.sun;
				else game.bloodbath = false;
			}

			// The match finished with one remaining player
			game.llrc.end();
			return msg.sendLocale('COMMAND_HG_WINNER', [game.tributes.values().next().value]);
		} catch (err) {
			game.llrc.end();
			throw err;
		}
	}

	buildTexts(language, game, results, deaths) {
		const header = language.get('COMMAND_HG_RESULT_HEADER', game);
		const death = deaths.length ? `${language.get('COMMAND_HG_RESULT_DEATHS', deaths.length)}\n\n${deaths.map(d => `- ${d}`).join('\n')}` : '';
		const proceed = language.get('COMMAND_HG_RESULT_PROCEED');
		const panels = chunk(results, 5);

		const texts = panels.map(panel => `__**${header}:**__\n\n${panel.map(text => `- ${text}`).join('\n')}\n\n_${proceed}_`);
		if (deaths.length) texts.push(`${death}\n\n_${proceed}_`);
		return texts;
	}

	pick(events, tributes, maxDeaths) {
		events = events.filter(event => event.tributes <= tributes && event.deaths.size <= maxDeaths);
		return events[Math.floor(Math.random() * events.length)];
	}

	pickTributes(tribute, turn, amount) {
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

	makeResultEvents(msg, game, events) {
		const results = [];
		const deaths = [];
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
			for (const picked of pickedTributes)
				turn.delete(picked);

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

	shuffle(tributes) {
		let m = tributes.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[tributes[m], tributes[i]] = [tributes[i], tributes[m]];
		}
		return new Set(tributes);
	}

	calculateMaxDeaths(game) {
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

};
