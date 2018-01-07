const { Collection, Guild } = require('discord.js');

/**
 * The Leaderboard singleton class in charge of storing local and global leaderboards
 * @since 3.0.0
 * @version 1.0.0
 */
class Leaderboard {

	/**
	 * @typedef  {Object} LeaderboardUser
	 * @property {number} points
	 * @property {number} position
	 * @memberof Leaderboard
	 */

	/**
	 * @typedef  {Object} LeaderboardTimeouts
	 * @property {?PreciseTimeout} users
	 * @property {Collection<string, PreciseTimeout>} guilds
	 * @memberof Leaderboard
	 */

	/**
	 * Create a new leaderboard singleton
	 * @since 3.0.0
	 * @param {Skyra} client The client that instantiated this class
	 */
	constructor(client) {
		/**
		 * The Client that initialized this instance
		 * @since 3.0.0
		 * @type {Skyra}
		 */
		this.client = client;

		/**
		 * The cached global leaderboard
		 * @since 3.0.0
		 * @type {Collection<string, LeaderboardUser>}
		 */
		this.users = new Collection();

		/**
		 * The cached collection for local leaderboards
		 * @since 3.0.0
		 * @type {Collection<string, Collection<string, LeaderboardUser>>}
		 */
		this.guilds = new Collection();

		/**
		 * The timeouts object
		 * @since 3.0.0
		 * @type {LeaderboardTimeouts}
		 */
		this.timeouts = {
			/**
			 * The timeout for the global leaderboard to reset
			 * @since 3.0.0
			 * @type {?PreciseTimeout}
			 */
			users: null,

			/**
			 * The collection of timeouts for each local leaderboard to reset
			 * @since 3.0.0
			 * @type {Collection<string, PreciseTimeout>}
			 */
			guilds: new Collection()
		};
	}

	/**
	 * Get the leaderboard for the selected guild
	 * @since 3.0.0
	 * @param {(string|Guild)} guild A guild id or instance
	 * @returns {Promise<Collection<string, LeaderboardUser>>}
	 */
	async getMembers(guild) {
		if (this.guilds.has(guild)) await this.syncMembers(guild);
		return this.guilds.get(guild);
	}

	/**
	 * Sync the leaderboard for the selected guild
	 * @since 3.0.0
	 * @param {(stringGuild)} guild A guild id or instance
	 */
	async syncMembers(guild) {
		if (!guild) throw new Error('The parameter \'guild\' must be specified.');
		if (guild instanceof Guild) guild = guild.id;
		if (typeof guild !== 'string') throw new TypeError(`Expected the parameter 'guild' to be an instance of Guild or a string. Got: ${typeof guild}`);

		// If it's still on timeout, reset it
		if (this.timeouts.guilds.has(guild)) {
			this.timeouts.guilds.get(guild).stop();
			// It's not deleting the entry as the previous run will resolve
		}

		// Get the sorted data from the db
		const data = await this.client.providers.get('postgresql')
			.runAll(`SELECT * FROM "localScores" WHERE "guild" = "${guild}" ORDER BY "points" DESC`);

		// Clear the leaderboards for said guild
		if (!this.guilds.has(guild)) this.guilds.set(guild, new Collection());
		else this.guilds.get(guild).clear();

		// Get the store and initialize the position number, then save all entries
		const store = this.guilds.get(guild);
		let i = 1;
		for (const entry of data) store.set(entry.id, { points: entry.points, position: i++ });

		// Set the timeout for the refresh
		const timeout = new PreciseTimeout(MINUTE * 30);
		this.timeouts.guilds.set(guild, timeout);
		timeout.run().then(() => {
			this.timeouts.guilds.delete(guild);
			this.guilds.get(guild).clear();
		});
	}

	/**
	 * Get the global leaderboard
	 * @since 3.0.0
	 * @returns {Promise<Collection<string, LeaderboardUser>>}
	*/
	async getUsers() {
		if (this.users.size === 0) await this.syncUsers();
		return this.users;
	}

	/**
	 * Sync the global leaderboard
	 * @since 3.0.0
	 */
	async syncUsers() {
		// If it's still on timeout, reset it
		if (this.timeouts.users) {
			this.timeouts.users.stop();
			// It's not deleting the entry as the previous run will resolve
		}

		// Get the sorted data from the db
		const data = await this.client.providers.get('postgresql')
			.runAll(`SELECT * FROM "users" ORDER BY "points" DESC`);

		// Get the store and initialize the position number, then save all entries
		this.users.clear();
		let i = 1;
		for (const entry of data) this.users.set(entry.id, { points: entry.points, position: i++ });

		// Set the timeout for the refresh
		this.timeouts.users = new PreciseTimeout(MINUTE * 30);
		this.timeouts.run().then(() => {
			this.timeouts.users = null;
			this.users.clear();
		});
	}

}

const SECOND = 1000;
const MINUTE = SECOND * 60;

module.exports = Leaderboard;

const PreciseTimeout = require('./PreciseTimeout');
