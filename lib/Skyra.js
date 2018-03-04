const { Client } = require('klasa');
const { loadavg } = require('os');

const Leaderboard = require('./util/Leaderboard');
const Moderation = require('./util/Moderation');
const APIStore = require('./structures/APIStore');
const RawEventStore = require('./structures/RawEventStore');
const IPC = require('./ipc/Controller');

module.exports = class Skyra extends Client {

	/**
	 * @typedef  {Object} SkyraUsageStatus
	 * @property {number[]} cpu
	 * @property {number[]} prc
	 * @property {number[]} ram
	 * @property {number[]} cmd
	 */

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

		/**
		 * The UsageStatus object containing Skyra's metrics in the last 12 hours,
		 * with an update every 5 minutes
		 * @since 2.0.0
		 * @type {SkyraUsageStatus}
		 */
		this.usageStatus = Object.seal({
			/**
			 * The CPU usage in the last 12 hours for each 5 minutes
			 * @type {number[]}
			 */
			cpu: new Array(96).fill(0),

			/**
			 * The RAM usage in the heap total in the last 12 hours for each 5 minutes
			 * @type {number[]}
			 */
			prc: new Array(96).fill(0),

			/**
			 * The RAM usage in the heap used in the last 12 hours for each 5 minutes
			 * @type {number[]}
			 */
			ram: new Array(96).fill(0),

			/**
			 * The amount of times any command got executed in the last 12 hours for each 5 minutes
			 * @type {number[]}
			 */
			cmd: new Array(96).fill(0)
		});

		/**
		 * The API handler
		 * @since 3.0.0
		 * @type {APIStore}
		 */
		this.ipcPieces = new APIStore(this);

		/**
		 * The Raw Event store
		 * @since 3.0.0
		 * @type {RawEventStore}
		 */
		this.rawEvents = new RawEventStore(this);

		// Update the stats
		this.updateStats();

		// Register the API handler
		this.registerStore(this.ipcPieces)
			.registerStore(this.rawEvents)
			.registerPiece('api', this.ipcPieces.holds)
			.registerPiece('rawEvent', this.rawEvents.holds);

		// Create the IPC controller singleton
		this.ipc = IPC.createInstance(this, {
			id: 'skyra-dashboard',
			retry: 1500,
			silent: true
		});

		/**
		 * @type {NodeJS.Timer}
		 * @since 3.0.0
		 * @private
		 */
		this._updateStatsInterval = setInterval(this.updateStats.bind(this), 300000);
	}

	/**
	 * Update the stats
	 * @since 2.1.0
	 */
	updateStats() {
		this.usageStatus.cpu.shift();
		this.usageStatus.cpu.push(((loadavg()[0] * 10000) | 0) / 100);

		this.usageStatus.prc.shift();
		this.usageStatus.prc.push(((100 * (process.memoryUsage().heapTotal / 1048576)) | 0) / 100);

		this.usageStatus.ram.shift();
		this.usageStatus.ram.push(((100 * (process.memoryUsage().heapUsed / 1048576)) | 0) / 100);

		this.usageStatus.cmd.shift();
		this.usageStatus.cmd.push(0);
	}

	/**
	 * Override for Client#destroy to clear intervals and cache
	 * @since 3.0.0
	 * @returns {Promise<void>}
	 */
	destroy() {
		// Clear the interval that updates the stats
		clearInterval(this._updateStatsInterval);

		// Clear the leaderboards and their timers
		this.leaderboard.dispose();

		// Clear all the timeouts and caches for all Guild#security
		for (const guild of this.guilds.values()) {
			guild.security.dispose();
			guild.starboard.dispose();
		}

		// Finally, correctly destroy the client
		return super.destroy();
	}

};
