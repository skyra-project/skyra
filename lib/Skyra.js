const { Client } = require('klasa');
const { Leaderboard, Moderation } = require('../index');

module.exports = class Skyra extends Client {

	constructor(options) {
		super(options);

		/**
		 * The loaded Leaderboard singleton instance
		 * @since 3.0.0
		 * @type {Leaderboard}
		 */
		this.leaderboard = new Leaderboard(this);

		/**
		 * The loaded Moderation singleton instance
		 * @since 3.0.0
		 * @type {Moderation}
		 */
		this.moderation = new Moderation(this);
	}

};
