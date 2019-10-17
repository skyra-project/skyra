// Import all dependencies
import { GatewayStorage, KlasaClient, KlasaClientOptions, Schema, util, Colors } from 'klasa';
import { Collection, Webhook } from 'discord.js';
import { Node as Lavalink } from 'lavalink';
import { Client as VezaClient } from 'veza';
import { FSWatcher } from 'chokidar';
import klasaDashboardHooks = require('klasa-dashboard-hooks');

// Import all types
import { Events } from './types/Enums';
import { Databases } from './types/constants/Constants';

// Import all structures
import { GiveawayManager } from './structures/GiveawayManager';
import { IPCMonitorStore } from './structures/IPCMonitorStore';
import { MemberGateway } from './structures/MemberGateway';

// Import all utils
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { VERSION, WEBHOOK_ERROR, DEV_LAVALINK, EVLYN_PORT } from '../../config';
import { ConnectFourManager } from './util/Games/ConnectFourManager';
import { clientOptions } from './util/constants';
import { Leaderboard } from './util/Leaderboard';
import { enumerable } from './util/util';

// Import all extensions and schemas
import './extensions/SkyraGuildMember';
import './extensions/SkyraTextChannel';
import './extensions/SkyraGuild';
import './schemas/Clients';
import './schemas/Guilds';
import './schemas/Users';

// Import setup files
import './setup/PermissionsLevels';
import './setup/Canvas';

const g = new Colors({ text: 'green' }).format('[IPC   ]');
const y = new Colors({ text: 'yellow' }).format('[IPC   ]');
const r = new Colors({ text: 'red' }).format('[IPC   ]');

// Canvas setup


export class SkyraClient extends KlasaClient {

	/**
	 * The version of Skyra
	 */
	public version = VERSION;

	/**
	 * The loaded Leaderboard singleton instance
	 */
	public leaderboard: Leaderboard = new Leaderboard(this);

	/**
	 * The IPC monitor store
	 */
	public ipcMonitors: IPCMonitorStore = new IPCMonitorStore(this);

	/**
	 * The Giveaway manager
	 */
	public giveaways: GiveawayManager = new GiveawayManager(this);

	/**
	 * The webhook to use for the error event
	 */
	public webhookError: Webhook = new Webhook(this, WEBHOOK_ERROR);

	public fsWatcher: FSWatcher | null = null;

	/**
	 * The ConnectFour manager
	 */
	@enumerable(false)
	public connectFour: ConnectFourManager = new ConnectFourManager(this);

	@enumerable(false)
	public usertags: Collection<string, string> = new Collection();

	@enumerable(false)
	public llrCollectors: Set<LongLivingReactionCollector> = new Set();

	@enumerable(false)
	public lavalink: Lavalink | null = DEV_LAVALINK
		? new Lavalink({
			send: (guildID: string, packet: object) => {
				const guild = this.guilds.get(guildID);
				if (guild) this.ws.shards.get(guild!.shardID)!.send(packet);
				else throw new Error('attempted to send a packet on the wrong shard');
			},
			...this.options.lavalink
		})
		: null;

	public ipc = new VezaClient('skyra-master')
		.on('disconnect', client => { this.emit(Events.Warn, `${y} Disconnected: ${client.name}`); })
		.on('ready', client => { this.emit(Events.Verbose, `${g} Ready ${client.name}`); })
		.on('error', (error, client) => { this.emit(Events.Error, `${r} Error from ${client.name}`, error); })
		.on('message', this.ipcMonitors.run.bind(this.ipcMonitors));

	public constructor(options: KlasaClientOptions = {}) {
		super(util.mergeDefault(clientOptions, options));

		const { members = {} } = (this.options.settings.gateways || {});
		members.schema = 'schema' in members ? members.schema : SkyraClient.defaultMemberSchema;
		this.gateways
			.register(new MemberGateway(this, Databases.Members, members))
			.register(new GatewayStorage(this, Databases.Banners))
			.register(new GatewayStorage(this, Databases.Giveaway))
			.register(new GatewayStorage(this, Databases.Moderation))
			.register(new GatewayStorage(this, Databases.Polls))
			.register(new GatewayStorage(this, Databases.Starboard))
			.register(new GatewayStorage(this, Databases.CommandCounter));

		// Register the API handler
		this.registerStore(this.ipcMonitors);

		if (!this.options.dev) {
			this.ipc.connectTo(EVLYN_PORT)
				.catch((error: Error) => { this.console.error(error); });
		}
	}

	public async fetchTag(id: string) {
		// Return from cache if exists
		const cache = this.usertags.get(id);
		if (cache) return cache;

		// Fetch the user and set to cache
		const user = await this.users.fetch(id);
		this.usertags.set(user.id, user.tag);
		return user.tag;
	}

	public async fetchUsername(id: string) {
		const tag = await this.fetchTag(id);
		return tag.slice(0, tag.indexOf('#'));
	}

	public static defaultMemberSchema = new Schema()
		.add('points', 'Number', { configurable: false });

}

SkyraClient.use(klasaDashboardHooks);
