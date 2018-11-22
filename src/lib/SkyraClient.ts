import { Collection } from 'discord.js';
import { KlasaClient, KlasaClientOptions, KlasaPieceDefaults, PieceOptions } from 'klasa';
import { MasterPool, R } from 'rethinkdb-ts';
import { Node } from 'veza';
import { VERSION } from '../../config';
import { IPCMonitorStore } from './structures/IPCMonitorStore';
import { MemberGateway } from './structures/MemberGateway';
import { RawEventStore } from './structures/RawEventStore';
import { ConnectFourManager } from './util/Games/ConnectFourManager';
import { Leaderboard } from './util/Leaderboard';
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { enumerable } from './util/util';

export interface SkyraClientOptions extends KlasaClientOptions {
	dev?: boolean;
	pieceDefaults?: SkyraClientPieceDefaults;
}

export interface SkyraClientPieceDefaults extends KlasaPieceDefaults {
	ipcMonitors?: PieceOptions;
	rawEvents?: PieceOptions;
}

export class SkyraClient extends KlasaClient {

	/**
	 * The version of Skyra
	 */
	public version = VERSION;

	/**
	 * The loaded Leaderboard singleton instance
	 */
	public leaderboard = new Leaderboard(this);

	/**
	 * The IPC monitor store
	 */
	public ipcMonitors = new IPCMonitorStore(this);

	/**
	 * The raw event store
	 */
	public rawEvents = new RawEventStore(this);

	/**
	 * The ConnectFour manager
	 */
	@enumerable(false)
	public connectFour = new ConnectFourManager(this);

	@enumerable(false)
	public usertags: Collection<string, string> = new Collection();

	@enumerable(false)
	public llrCollectors: Set<LongLivingReactionCollector> = new Set();

	/**
	 * The Veza Node
	 */
	public ipc = new Node('skyra-master')
		.on('client.connect', (client) => this.emit('verbose', `[IPC] Client Connected: ${client.name}`))
		.on('client.disconnect', (client) => this.emit('warn', `[IPC] Client Disconnected: ${client.name}`))
		.on('client.destroy', (client) => this.emit('warn', `[IPC] Client Destroyed: ${client.name}`))
		.on('client.ready', (client) => this.emit('verbose', `[IPC] Client Ready: Named ${client.name}`))
		.on('error', (error, client) => this.emit('error', `[IPC] Error from ${client.name}: ${error}`))
		.on('message', this.ipcMonitors.run.bind(this.ipcMonitors));

	public constructor(options?: SkyraClientOptions) {
		super(options);

		this.gateways.register(new MemberGateway(this, 'members'));

		// Register the API handler
		this.registerStore(this.ipcMonitors)
			.registerStore(this.rawEvents);

		if (!options.dev) {
			this.ipc.connectTo('ny-api', 9997)
				.catch((error) => { this.console.error(error); });
		}
	}

	public async fetchTag(id: string): Promise<string> {
		// Return from cache if exists
		const cache = this.usertags.get(id);
		if (cache) return cache;

		// Fetch the user and set to cache
		const user = await this.users.fetch(id);
		this.usertags.set(user.id, user.tag);
		return user.tag;
	}

	public async fetchUsername(id: string): Promise<string> {
		const tag = await this.fetchTag(id);
		return tag.slice(0, tag.indexOf('#'));
	}

}

declare module 'discord.js' {

	export interface Client {
		version: string;
		leaderboard: Leaderboard;
		ipcMonitors: IPCMonitorStore;
		rawEvents: RawEventStore;
		connectFour: ConnectFourManager;
		usertags: Collection<string, string>;
		llrCollectors: Set<LongLivingReactionCollector>;
		ipc: Node;
		fetchTag(id: string): Promise<string>;
		fetchUsername(id: string): Promise<string>;
	}

}

declare module 'klasa' {

	export interface Provider {
		db: R;
		pool: MasterPool;
		ping(): Promise<number>;
		sync(table: string): Promise<{ synced: number }>;
		getRandom(table: string): Promise<any>;
	}

}
