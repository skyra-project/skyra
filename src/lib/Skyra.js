const { Client } = require('klasa');
const { loadavg } = require('os');

const Leaderboard = require('./util/Leaderboard');
const Moderation = require('./util/Moderation');
const APIStore = require('./structures/APIStore');
const RawEventStore = require('./structures/RawEventStore');
const { Node } = require('veza');
const ConnectFourManager = require('./util/Games/ConnectFourManager');
const TimeoutManager = require('./util/Ratelimits/TimeoutManager');

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
		 * The version of Skyra
		 * @since 2.0.0
		 * @type {string}
		 */
		this.version = require('../../config').version;

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

		// Register the API handler
		this.registerStore(this.ipcPieces)
			.registerStore(this.rawEvents);

		// Create the IPC controller singleton
		this.ipc = new Node('skyra-bot')
			.on('client.connect', (client) => this.emit('verbose', `[IPC] Client Connected: ${client.name}`))
			.on('client.disconnect', (client) => this.emit('warn', `[IPC] Client Disconnected: ${client.name}`))
			.on('client.destroy', (client) => this.emit('warn', `[IPC] Client Destroyed: ${client.name}`))
			.on('client.ready', (client) => this.emit('verbose', `[IPC] Client Ready: Named ${client.name}`))
			.on('error', (error, client) => this.emit('error', `[IPC] Error from ${client.name}: ${error}`))
			.on('message', this.emit.bind(this, 'apiMessage'));

		if (!options.dev) this.ipc.connectTo('skyra-dashboard', 8800);

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

		// Update the stats
		this.updateStats();

		Object.defineProperties(this, {
			connectFour: { writable: true },
			timeoutManager: { writable: true },
			_updateStatsInterval: { writable: true },
			_skyraReady: { writable: true }
		});

		/**
		 * The ConnectFour manager
		 * @since 3.0.0
		 * @type {ConnectFourManager}
		 */
		this.connectFour = new ConnectFourManager(this);

		/**
		 * The TimeoutManager instance
		 * @since 3.3.0
		 * @type {TimeoutManager}
		 */
		this.timeoutManager = new TimeoutManager(this);

		/**
		 * @type {NodeJS.Timer}
		 * @since 3.0.0
		 * @private
		 */
		this._updateStatsInterval = this.setInterval(this.updateStats.bind(this), 300000);

		/**
		 * @type {boolean}
		 * @since 3.1.0
		 * @private
		 */
		this._skyraReady = false;
	}

	/**
	 * Update the stats
	 * @since 2.1.0
	 */
	updateStats() {
		const { heapTotal, heapUsed } = process.memoryUsage();

		this.usageStatus.cpu.shift();
		this.usageStatus.cpu.push(((loadavg()[0] * 10000) | 0) / 100);

		this.usageStatus.prc.shift();
		this.usageStatus.prc.push(((100 * (heapTotal / 1048576)) | 0) / 100);

		this.usageStatus.ram.shift();
		this.usageStatus.ram.push(((100 * (heapUsed / 1048576)) | 0) / 100);

		this.usageStatus.cmd.shift();
		this.usageStatus.cmd.push(0);
	}

	/**
	 * Override for Client#destroy to clear intervals and cache
	 * @since 3.0.0
	 */
	dispose() {
		// Clear the leaderboards and their timers
		this.leaderboard.dispose();

		// Clear all the timeouts and caches for all Guild#security
		for (const guild of this.guilds.values()) {
			// @ts-ignore
			guild.security.dispose();
			// @ts-ignore
			guild.starboard.dispose();
			// @ts-ignore
			guild.nameDictionary.clear();
		}
	}

};
