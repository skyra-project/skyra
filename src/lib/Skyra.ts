import { Client } from 'klasa';
import { loadavg } from 'os';

import { Node } from 'veza';
import APIStore from './structures/APIStore';
import RawEventStore from './structures/RawEventStore';
import ConnectFourManager from './util/Games/ConnectFourManager';
import Leaderboard from './util/Leaderboard';
import TimeoutManager from './util/Ratelimits/TimeoutManager';

import { enumerable } from './types/Decorators';
import { SkyraGuildStore } from './types/discord.js';
import { ProviderStore, PermissionLevels } from './types/klasa';

import { VERSION } from '../../config';
import { SkyraClientOptions } from './types/skyra';

type SkyraUsageStatus = {
	/**
	 * The amount of times any command got executed in the last 12 hours for each 5 minutes
	 */
	cmd: Array<number>;
	/**
	 * The CPU usage in the last 12 hours for each 5 minutes
	 */
	cpu: Array<number>;
	/**
	 * The RAM usage in the heap total in the last 12 hours for each 5 minutes
	 */
	prc: Array<number>;
	/**
	 * The RAM usage in the heap used in the last 12 hours for each 5 minutes
	 */
	ram: Array<number>;
};

export default class Skyra extends Client {

	public constructor(options?: SkyraClientOptions) {
		super(options);

		this.version = VERSION;
		this.leaderboard = new Leaderboard(this);
		this.ipcPieces = new APIStore(this);
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

		if (!this.options.dev) this.ipc.connectTo('skyra-dashboard', 8800);

		this.usageStatus = Object.seal({
			cmd: new Array(96).fill(0),
			cpu: new Array(96).fill(0),
			prc: new Array(96).fill(0),
			ram: new Array(96).fill(0)
		});

		this.connectFour = new ConnectFourManager(this);
		this.timeoutManager = new TimeoutManager(this);
		this._updateStatsInterval = this.setInterval(this.updateStats.bind(this), 300000);
		this._skyraReady = false;

		// Update the stats
		this.updateStats();
	}
	/**
	 * Whether Skyra is ready or not
	 * @since 3.1.0
	 */
	@enumerable(false)
	public _skyraReady: boolean;
	/**
	 * The stats interval timer
	 * @since 3.0.0
	 */
	@enumerable(false)
	public _updateStatsInterval: NodeJS.Timer;

	/**
	 * The ConnectFour manager
	 * @since 3.0.0
	 */
	@enumerable(false)
	public connectFour: ConnectFourManager;

//#region Overrides
	// @ts-ignore
	public static defaultPermissionLevels: PermissionLevels = Client.defaultPermissionLevels;
	public options: SkyraClientOptions = this.options;
	public guilds: SkyraGuildStore = this.guilds;
	public providers: ProviderStore = this.providers;
//#endregion Overrides

	/**
	 * The IPC Node manager for this Client
	 * @since 3.0.0
	 */
	public ipc: Node;
	/**
	 * The API handler
	 * @since 3.0.0
	 */
	public ipcPieces: APIStore;
	/**
	 * The loaded Leaderboard singleton instance
	 * @since 3.0.0
	 */
	public leaderboard: Leaderboard;
	/**
	 * The Raw Event store
	 * @since 3.0.0
	 */
	public rawEvents: RawEventStore;
	/**
	 * The TimeoutManager instance
	 * @since 3.3.0
	 */
	@enumerable(false)
	public timeoutManager: TimeoutManager;
	/**
	 * The UsageStatus object containing Skyra's metrics in the last 12 hours,
	 * with an update every 5 minutes
	 * @since 2.0.0
	 */
	public usageStatus: Readonly<SkyraUsageStatus>;

	/**
	 * The version of Skyra
	 * @since 2.0.0
	 */
	public version: string;

	/**
	 * Override for Client#destroy to clear intervals and cache
	 * @since 3.0.0
	 */
	public dispose(): void {
		// Clear the leaderboards and their timers
		this.leaderboard.dispose();

		// Clear all the timeouts and caches for all Guild#security
		for (const guild of this.guilds.values()) {
			guild.security.dispose();
			guild.starboard.dispose();
			guild.nameDictionary.clear();
		}
	}

	/**
	 * Update the stats
	 * @since 2.1.0
	 */
	private updateStats(): void {
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

}
