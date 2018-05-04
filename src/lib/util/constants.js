const { API } = require('../../config');

module.exports = {

	TIME: Object.freeze({
		MILLISECOND: 1,
		SECOND: 1000,
		MINUTE: 1000 * 60,
		HOUR: 1000 * 60 * 60,
		DAY: 1000 * 60 * 60 * 24
	}),

	EMOJIS: Object.freeze({ SHINY: '<:ShinyYellow:324157128270938113>' }),

	CONNECT_FOUR: Object.freeze({
		EMOJIS: {
			1: '<:PlayerONE:352403997300359169>',
			2: '<:PlayerTWO:352404081974968330>',
			0: '<:Empty:352403997606412289>',
			WINNER_1: '<:PlayerONEWin:352403997761601547>',
			WINNER_2: '<:PlayerTWOWin:352403997958602752>'
		},
		REACTIONS: '1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣'.split(' '),
		REACTION_OPTIONS: {
			time: 60000,
			max: 1
		},
		RESPONSES: {
			FULL_LINE: 0,
			FULL_GAME: 1,
			TIMEOUT: 2
		}
	}),

	API

};
