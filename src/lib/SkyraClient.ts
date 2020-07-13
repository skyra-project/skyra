/* eslint-disable @typescript-eslint/no-invalid-this */
// Import all dependencies
import { GatewayStorage, KlasaClient, KlasaClientOptions, Schema, util } from 'klasa';
import { Colors } from '@klasa/console';
import { Manager as LavalinkManager } from '@utils/Music/ManagerWrapper';
import { Client as VezaClient } from 'veza';
import { Webhook } from 'discord.js';
import { FSWatcher } from 'chokidar';
import { DashboardClient } from 'klasa-dashboard-hooks';
import { InfluxDB, WriteApi, WritePrecision } from '@influxdata/influxdb-client';

// Import all types
import { Events } from './types/Enums';
import { Databases } from './types/constants/Constants';

// Import all structures
import { GiveawayManager } from './structures/GiveawayManager';
import { IPCMonitorStore } from './structures/IPCMonitorStore';

// Import all utils
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { ConnectFourManager } from './util/Games/ConnectFourManager';
import { Twitch } from './util/Notifications/Twitch';
import { clientOptions } from './util/constants';
import { Leaderboard } from './util/Leaderboard';
import { UserTags } from './util/Cache/UserTags';
import { enumerable } from './util/util';

// Import all configuration
import {
	ENABLE_POSTGRES,
	EVLYN_PORT,
	VERSION,
	WEBHOOK_ERROR,
	WEBHOOK_FEEDBACK,
	ENABLE_INFLUX,
	INFLUX_OPTIONS,
	INFLUX_ORG,
	INFLUX_ORG_ANALYTICS_BUCKET
} from '@root/config';

// Import all extensions and schemas
import './extensions/SkyraGuild';
import './schemas/Clients';
import './schemas/Guilds';
import './schemas/Users';
import { BannerSchema } from './schemas/Banners';

// Import setup files
import './setup/PermissionsLevels';
import './setup/Canvas';
import { CommonQuery } from './queries/common';
import { PostgresCommonQuery } from './queries/postgres';
import { JsonCommonQuery } from './queries/json';
import { WebsocketHandler } from './websocket';
import { InviteStore } from './structures/InviteStore';

const g = new Colors({ text: 'green' }).format('[IPC   ]');
const y = new Colors({ text: 'yellow' }).format('[IPC   ]');
const r = new Colors({ text: 'red' }).format('[IPC   ]');

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

	/**
	 * The webhook to use for feedbacks
	 */
	public webhookFeedback: Webhook | null = WEBHOOK_FEEDBACK ? new Webhook(this, WEBHOOK_FEEDBACK) : null;

	/**
	 * The invite store
	 */
	public invites: InviteStore = new InviteStore(this);

	/**
	 * The common queries for the database
	 */
	public queries: CommonQuery = ENABLE_POSTGRES
		? new PostgresCommonQuery(this)
		: new JsonCommonQuery(this);

	public fsWatcher: FSWatcher | null = null;

	public analytics: WriteApi | null = ENABLE_INFLUX
		? new InfluxDB(INFLUX_OPTIONS).getWriteApi(INFLUX_ORG, INFLUX_ORG_ANALYTICS_BUCKET, WritePrecision.s)
		: null;

	/**
	 * The ConnectFour manager
	 */
	@enumerable(false)
	public connectFour: ConnectFourManager = new ConnectFourManager(this);

	@enumerable(false)
	public userTags: UserTags = new UserTags(this);

	@enumerable(false)
	public llrCollectors: Set<LongLivingReactionCollector> = new Set();

	@enumerable(false)
	public lavalink: LavalinkManager = new LavalinkManager(this, this.options.lavalink);

	@enumerable(false)
	public twitch: Twitch = new Twitch();

	public ipc = new VezaClient('skyra-master')
		.on('disconnect', client => { this.emit(Events.Warn, `${y} Disconnected: ${client.name}`); })
		.on('ready', client => { this.emit(Events.Verbose, `${g} Ready ${client.name}`); })
		.on('error', (error, client) => { this.emit(Events.Error, `${r} Error from ${client.name}`, error); })
		.on('message', this.ipcMonitors.run.bind(this.ipcMonitors));

	public websocket = new WebsocketHandler(this);

	public constructor(options: KlasaClientOptions = {}) {
		super(util.mergeDefault(clientOptions, options));

		this.gateways
			.register(new GatewayStorage(this, Databases.Members))
			.register(new GatewayStorage(this, Databases.Banners, { schema: BannerSchema }))
			.register(new GatewayStorage(this, Databases.Giveaway))
			.register(new GatewayStorage(this, Databases.Moderation))
			.register(new GatewayStorage(this, Databases.Starboard))
			.register(new GatewayStorage(this, Databases.CommandCounter))
			.register(new GatewayStorage(this, Databases.TwitchStreamSubscriptions))
			.register(new GatewayStorage(this, Databases.DashboardUsers))
			.register(new GatewayStorage(this, Databases.Suggestions));

		// Register the API handler
		this.registerStore(this.ipcMonitors);

		if (!this.options.dev) {
			this.ipc.connectTo(EVLYN_PORT)
				.catch((error: Error) => { this.console.error(error); });
		}
	}

	public static defaultMemberSchema = new Schema()
		.add('points', 'Number', { configurable: false });

}

SkyraClient.use(DashboardClient);
