const { Command, klasaUtil: { chunk } } = require('../../index');

const RESPONSE_OPTIONS = { time: 120000, errors: ['time'], max: 1 };

module.exports = class extends Command {

	/**
	 * @typedef {Object} HungerGamesContext
	 * @property {boolean} bloodbath
	 * @property {boolean} sun
	 * @property {string[]} tributes
	 * @property {number} turn
	 */

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['hunger-games'],
			requiredPermissions: ['ADD_REACTIONS'],
			cooldown: 0,
			description: (language) => language.get('COMMAND_HUNGERGAMES_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_HUNGERGAMES_EXTENDED'),
			runIn: ['text'],
			usage: '<user:string{,50}> [...]',
			usageDelim: ' '
		});

		this.playing = new Set();
	}

	async run(msg, tributes) {
		const filtered = new Set(tributes);
		if (filtered.size !== tributes.length) throw msg.language.get('COMMAND_GAMES_REPEAT');
		if (this.playing.has(msg.channel.id)) throw msg.language.get('COMMAND_GAMES_PROGRESS');
		this.playing.add(msg.channel.id);

		try {
			const game = Object.seal({
				bloodbath: true,
				sun: true,
				tributes: new Set(this.shuffle([...filtered])),
				turn: 0
			});
			while (game.tributes.size > 1) {
				// If it's not bloodbath and it became the day, increase the turn
				if (!game.bloodbath && game.sun) game.turn++;
				const events = game.bloodbath ? 'HG_BLOODBATH' : game.sun ? 'HG_DAY' : 'HG_NIGHT';

				// Main logic of the game
				const { results, deaths } = this.makeResultEvents(msg, game, msg.language.get(events));
				const texts = this.buildTexts(msg.language, game, results, deaths);

				// Ask for the user to proceed
				for (const text of texts) {
					const verification = await msg.ask(text, {}, RESPONSE_OPTIONS);
					if (!verification) {
						this.playing.delete(msg.channel.id);
						return msg.sendLocale('COMMAND_HG_STOP');
					}
				}
				if (!game.bloodbath) game.sun = !game.sun;
				else game.bloodbath = false;
			}

			// The match finished with one remaining player
			this.playing.delete(msg.channel.id);
			return msg.sendLocale('COMMAND_HG_WINNER', [game.tributes.values().next().value]);
		} catch (err) {
			this.playing.delete(msg.channel.id);
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
		const result = [tribute];
		array.splice(array.indexOf(tribute), 1);
		for (let i = 1; i < amount; i++) [result[i]] = array.splice(Math.floor(Math.random() * array.length), 1);
		return result;
	}

	makeResultEvents(msg, game, events) {
		const results = [];
		const deaths = [];
		const turn = new Set([...game.tributes]);
		for (const tribute of game.tributes) {
			// If the player already had its turn, skip
			if (!turn.has(tribute)) continue;

			// Pick a valid event
			const event = this.pick(events, turn.size, deaths.length === 0 ? game.tributes.size <= 8 ? 2 : game.tributes.size / 2 : 1);

			// Pick the tributes
			const pickedTributes = this.pickTributes(tribute, turn, event.tributes);

			// Delete all the picked tributes from this round
			for (const picked of pickedTributes)
				turn.delete(picked);

			// Kill all the unfortunate tributes
			for (const death of event.deaths) {
				game.tributes.delete(pickedTributes[death]);
				deaths.push(pickedTributes[death]);
			}

			// Push the result of this match
			results.push(event.display(...pickedTributes));
		}

		return { results, deaths };
	}

	shuffle(tributes) {
		const arr = tributes.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return new Set(tributes);
	}

};
